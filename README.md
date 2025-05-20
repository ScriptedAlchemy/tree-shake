# Advanced JavaScript Macro System & On-the-Fly Optimization Demo

This repository demonstrates a Closure Compiler-inspired macro system for JavaScript. It includes:
1.  A build-time preprocessor (`optimizer.js` in CLI mode) for conditional code removal based on a JSON configuration.
2.  An advanced concept: simulating an Edge Worker (`edge-worker-simulation.js`) that uses this macro system to perform **per-request, on-the-fly JavaScript optimization** based on incoming request headers.

## Core Features of the Macro System

-   **Externalized Definitions**: Macro values (e.g., feature flags, environment variables) are passed as a JSON object to the optimizer, not hardcoded in comments within the source.
-   **Conditional Code Blocks**: `/* @if(expression) */ ... /* @else */ ... /* @endif */` allow for including/excluding blocks of code.
-   **Inline Conditional Expressions**: `if (/* @if(expression) */ false) { ... }` allows standard `if` statements to be processed by replacing `false` with the compile-time evaluation of the expression.
-   **Dot Notation**: Supports nested macro variables (e.g., `device.isMobile`, `user.preferences.theme`).
-   **Complex Expressions**: Conditions can use logical operators (`&&`, `||`, `!`) and comparisons.

## 1. Build-Time Optimization (CLI)

The `optimizer.js` script can be used as a command-line tool to process a JavaScript file at build time.

**Usage:**
```bash
node optimizer.js <inputFile.js> <outputFile.js> '<jsonDefinitions>'
```

**Example:**
```bash
node optimizer.js app-template.js processed-app.js '{"device.isMobile":false, "user.language":"en", "experiment.group":"B"}'
```
This will read `app-template.js`, apply the macros based on the provided JSON, and write the optimized code to `processed-app.js`.

## 2. On-the-Fly Optimization at the Edge (Simulated)

This is a more advanced demonstration showcasing how the same macro system could be used for runtime optimizations, for instance, within a Cloudflare Worker or similar edge compute environment.

**Concept:**

Instead of generating a single, universally optimized bundle at build time, the edge worker intercepts each incoming user request. It analyzes request headers (like `User-Agent`, `Accept-Language`, cookies for A/B testing, custom headers for feature flags) to dynamically construct a set of `defines` specific to that user and their context. It then processes a master JavaScript template (`app-template.js`) using these dynamic `defines` to generate a uniquely optimized JavaScript payload for that user, on the fly.

**Files:**

-   `app-template.js`: The master JavaScript application code containing various macros tied to user/device characteristics.
-   `optimizer.js`: Contains the `optimizeJavaScript(code, defines)` function (the same core logic as the CLI tool).
-   `edge-worker-simulation.js`: A Node.js script that simulates this edge worker environment. It defines several mock user requests with different headers, calls the optimizer for each, and prints the resulting tailored JavaScript.

**How to Run the Edge Simulation:**
```bash
node edge-worker-simulation.js
```
This will output the processed JavaScript for several different simulated user profiles, demonstrating how the code changes based on the dynamic `defines`.

**Benefits of On-the-Fly Edge Optimization:**

-   **Highly Tailored Payloads**: Users download only the code they need, potentially improving performance, especially for diverse user bases or complex A/B testing scenarios.
-   **Reduced Client-Side Logic**: Logic for feature flagging or device adaptation can be partly handled at the edge, simplifying client-side code.

**Challenges:**

-   **Latency**: Processing JavaScript on every request, even at the edge, adds latency. The optimizer must be extremely fast (e.g., implemented in Rust/WASM, like SWC itself, if it were to support this natively).
-   **Caching**: Effective caching strategies for generated code (based on common `defines` combinations) would be crucial to mitigate latency.
-   **Complexity**: Managing the JavaScript template and the logic for deriving `defines` can become complex.

## Macro Syntax in `app-template.js`

(See `app-template.js` for detailed examples.)

-   **Block Condition:**
    ```javascript
    /* @if(device.isMobile && featureFlags.newMobileUI) */
    console.log("Optimized for new mobile UI.");
    /* @else */
    console.log("Using standard or desktop UI.");
    /* @endif */
    ```
-   **Inline Condition:**
    ```javascript
    if (/* @if(user.isLoggedIn) */ false) {
      loadUserData();
    }
    ```

This repository provides the building blocks and a conceptual demonstration for such advanced optimization techniques. The core idea is to leverage a powerful macro system that can be applied both at build-time and, with careful consideration for performance, at runtime on the edge. 