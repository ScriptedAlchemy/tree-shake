// This is a template for a JavaScript application.
// It uses macros that will be processed on the fly by an edge worker
// based on incoming request headers and device details.

// Hypothetical defines that will be passed by the edge worker:
// {
//   "device.isMobile": true, // boolean
//   "device.screenWidth": 360, // number
//   "user.language": "en-US", // string
//   "user.isLoggedIn": false, // boolean
//   "experiment.group": "A", // string (e.g., A/B test group)
//   "featureFlags.newUserProfile": true // boolean
// }

function initializeApp(config) {
  console.log("Initializing core application logic...");
  console.log("User language preference:", config.language);

  /* @if(device.isMobile) */
  console.log("Device detected: Mobile specific UI enhancements loading...");
  loadMobileLayout();
  /* @if(device.screenWidth < 400) */
  console.log("Device screen width is small, applying compact mode.");
  applyCompactMode();
  /* @endif */
  /* @else */
  console.log("Device detected: Desktop layout loading...");
  loadDesktopLayout();
  /* @endif */

  /* @if(user.isLoggedIn) */
  console.log("User is logged in. Fetching personalized data...");
  fetchPersonalizedData();
  /* @if(featureFlags.newUserProfile) */
  console.log("New user profile feature is ON.");
  renderNewUserProfile();
  /* @else */
  console.log("Old user profile is in use.");
  renderOldUserProfile();
  /* @endif */
  /* @else */
  console.log("User is not logged in. Showing generic content.");
  showLoginPrompt();
  /* @endif */
}

function loadMobileLayout() { console.log("[Executed] loadMobileLayout()"); }
function applyCompactMode() { console.log("[Executed] applyCompactMode()"); }
function loadDesktopLayout() { console.log("[Executed] loadDesktopLayout()"); }
function fetchPersonalizedData() { console.log("[Executed] fetchPersonalizedData()"); }
function renderNewUserProfile() { console.log("[Executed] renderNewUserProfile()"); }
function renderOldUserProfile() { console.log("[Executed] renderOldUserProfile()"); }
function showLoginPrompt() { console.log("[Executed] showLoginPrompt()"); }

// Example of using an experiment group
/* @if(experiment.group === "A") */
console.log("User is in Experiment Group A: Using new algorithm.");
function runExperiment() { console.log("[Executed] Experiment A logic"); }
/* @endif */

/* @if(experiment.group === "B") */
console.log("User is in Experiment Group B: Using standard algorithm.");
function runExperiment() { console.log("[Executed] Experiment B logic (standard)"); }
/* @endif */

// Call initialization with some initial config (could be supplemented by worker defines)
initializeApp({ language: 'en' }); // Base language
if (typeof runExperiment === 'function') runExperiment();

console.log("App template loaded and initial functions called."); 