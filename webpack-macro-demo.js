// webpack-macro-demo.js

// Example: A Webpack chunk with macro annotations for conditional exports

/***/ "./src/featureA.js":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* @if(featureFlags.enableFeatureA) */
/* harmony export */   "featureA": function() { return featureA; },
/* @endif */
});

function featureA() {
    return "Feature A is enabled!";
}

})

/***/ "./src/featureB.js":
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* @if(featureFlags.enableFeatureB) */
/* harmony export */   "featureB": function() { return featureB; },
/* @endif */
});

function featureB() {
    return "Feature B is enabled!";
}

})

// Example usage in a macro-enabled build:
// If featureFlags.enableFeatureA is false, the export for featureA will be removed from the chunk.
// If featureFlags.enableFeatureB is true, the export for featureB will be present. 