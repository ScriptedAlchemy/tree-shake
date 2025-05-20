const fs = require('fs');
const vm = require('vm');

function buildContextFromConfig(definesConfig) {
  const context = {};
  for (const key in definesConfig) {
    if (Object.hasOwnProperty.call(definesConfig, key)) {
      setDeep(context, key.split('.'), definesConfig[key]);
    }
  }
  return context;
}

function setDeep(obj, pathArr, value) {
  let current = obj;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i];
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  current[pathArr[pathArr.length - 1]] = value;
}

function evalWithContext(expr, context) {
  try {
    // should not use js eval in rust, but makes a dirty solution for basic match.
    const sandbox = { ...context, console };
    return vm.runInNewContext(expr, sandbox);
  } catch (e) {
    // It's better to let errors propagate if an expression is truly invalid
    // or a define is missing, rather than defaulting to false, for debugging.
    // console.error(`Error evaluating expression "${expr}":`, e.message);
    // return false;
    throw new Error(`Error evaluating macro expression "${expr}": ${e.message}. Context: ${JSON.stringify(context)}`);
  }
}

function optimizeJavaScript(jsCodeString, definesConfig) {
  const definesContext = buildContextFromConfig(definesConfig);
  const lines = jsCodeString.split('\n');
  let output = [];
  let skip = false;
  let skipStack = [];

  const ifBlockRegex = /^\s*\/\*\s*@if\((.+)\)\s*\*\//;
  const endifRegex = /^\s*\/\*\s*@endif\s*\*\//;
  const inlineIfRegex = /(\s*if\s*\(\s*)\/\*\s*@if\((.+?)\)\s*\*\/\s*(false)(\s*\)\s*\{?)/;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    const ifMatch = line.match(ifBlockRegex);
    if (ifMatch) {
      const cond = ifMatch[1];
      const result = evalWithContext(cond, definesContext);
      skipStack.push(skip);
      skip = skip || !result;
      continue;
    }

    if (endifRegex.test(line)) {
      if (skipStack.length === 0) {
        throw new Error(`Unmatched /* @endif */ at line ${i + 1}: "${line.trim()}"`);
      }
      skip = skipStack.pop();
      continue;
    }

    if (skip) {
      continue;
    }
    
    const inlineIfMatch = line.match(inlineIfRegex);
    if (inlineIfMatch) {
        const [, prefix, expr, , suffix] = inlineIfMatch;
        const result = evalWithContext(expr, definesContext);
        line = prefix + result + suffix;
    }
    
    output.push(line);
  }

  if (skipStack.length > 0) {
    throw new Error("Unmatched /* @if(...) */ blocks; missing /* @endif */.");
  }

  return output.join('\n');
}

module.exports = { optimizeJavaScript, buildContextFromConfig };

// Main execution block for CLI (no longer primary use for this file)
if (require.main === module) {
  const [,, inputFilePath, outputFilePath, definesJson] = process.argv;
  if (!inputFilePath || !outputFilePath || !definesJson) {
    console.log(`CLI Usage: node optimizer.js <inputFilePath> <outputFilePath> '<json_definitions>'`);
    console.log(`Example: node optimizer.js app-template.js output.js '{"meta.env":"production","meta.isAbTestA":true}'`);
    process.exit(1);
  }
  try {
    const jsCodeString = fs.readFileSync(inputFilePath, 'utf8');
    const definesConfig = JSON.parse(definesJson);
    const processedCode = optimizeJavaScript(jsCodeString, definesConfig);
    fs.writeFileSync(outputFilePath, processedCode, 'utf8');
    console.log(`Processed ${inputFilePath} -> ${outputFilePath}`);
  } catch (e) {
    console.error("Error during CLI processing:", e.message);
    process.exit(1);
  }
} 