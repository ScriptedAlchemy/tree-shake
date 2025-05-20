const fs = require('fs');
const path = require('path');
const { optimizeJavaScript } = require('./optimizer');

// Simulate reading the application template code
const appTemplatePath = path.join(__dirname, 'app-template.js');
const appTemplateCode = fs.readFileSync(appTemplatePath, 'utf8');

// --- Simulation of different incoming requests ---

function handleRequest(simulatedRequest) {
  console.log(`\n--- Handling Request: ${simulatedRequest.description} ---`);
  console.log("Incoming Headers:", simulatedRequest.headers);

  // 1. Extract information from headers to create 'defines'
  const defines = {};
  const userAgent = simulatedRequest.headers['user-agent'] || '';
  const acceptLanguage = simulatedRequest.headers['accept-language'] || 'en';
  const cookie = simulatedRequest.headers['cookie'] || '';

  // Device detection (simplified)
  defines['device.isMobile'] = /Mobi|Android/i.test(userAgent);
  if (defines['device.isMobile']) {
    defines['device.screenWidth'] = parseInt(simulatedRequest.headers['x-screen-width'] || '360', 10);
  } else {
    defines['device.screenWidth'] = parseInt(simulatedRequest.headers['x-screen-width'] || '1920', 10);
  }

  // User preferences/status
  defines['user.language'] = acceptLanguage.split(',')[0]; // e.g., en-US, fr
  defines['user.isLoggedIn'] = cookie.includes('session_token=active');
  
  // A/B Testing Group (e.g., from a cookie or a header set by load balancer)
  const abGroupMatch = cookie.match(/ab_group=([^;]+)/);
  defines['experiment.group'] = abGroupMatch ? abGroupMatch[1] : 'A'; // Default to group A

  // Feature Flags (e.g., from a custom header or configuration)
  defines['featureFlags.newUserProfile'] = simulatedRequest.headers['x-ff-new-profile'] === 'true';

  console.log("Derived Defines:", defines);

  // 2. Optimize JavaScript on the fly
  try {
    console.time("OptimizationTime");
    const optimizedJs = optimizeJavaScript(appTemplateCode, defines);
    console.timeEnd("OptimizationTime");

    // 3. "Serve" the optimized JavaScript
    console.log("\n--- Optimized JavaScript for this request ---");
    console.log(optimizedJs);
    console.log("--- End of Optimized JavaScript ---");
    return optimizedJs;
  } catch (error) {
    console.error("\n--- Error during optimization ---");
    console.error(error.message);
    console.log("--- End of Error ---");
    // Serve fallback or log error
    return `// Error during optimization: ${error.message}`;
  }
}

// --- Define Simulated Requests ---
const requests = [
  {
    description: "Mobile User, Logged In, Group B, New Profile FF ON",
    headers: {
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1',
      'accept-language': 'en-US,en;q=0.9',
      'cookie': 'session_token=active; ab_group=B',
      'x-screen-width': '375',
      'x-ff-new-profile': 'true'
    }
  },
  {
    description: "Desktop User, Not Logged In, Group A, New Profile FF OFF",
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36',
      'accept-language': 'fr-FR,fr;q=0.9',
      'cookie': 'ab_group=A',
      'x-screen-width': '1920',
      'x-ff-new-profile': 'false'
    }
  },
  {
    description: "Mobile User, Not Logged In, Group A, Old Profile (FF missing)",
    headers: {
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.152 Mobile Safari/537.36',
      'accept-language': 'es-ES,es;q=0.9',
      'cookie': 'ab_group=A',
      'x-screen-width': '360'
      // x-ff-new-profile is missing, will default to false
    }
  }
];

// Process all simulated requests
requests.forEach(req => {
  handleRequest(req);
  console.log("\n=========================================================\n");
});

console.log("\nEdge worker simulation finished.");
console.log("Note: In a real Cloudflare Worker, you'd use the Request object from the 'fetch' event.");
console.log("The optimizeJavaScript function would operate on code strings, ideally cached."); 