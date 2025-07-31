/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-electron";
exports.ids = ["vendor-chunks/is-electron"];
exports.modules = {

/***/ "(ssr)/../node_modules/is-electron/index.js":
/*!********************************************!*\
  !*** ../node_modules/is-electron/index.js ***!
  \********************************************/
/***/ ((module) => {

eval("// https://github.com/electron/electron/issues/2288\nfunction isElectron() {\n    // Renderer process\n    if (false) {}\n    // Main process\n    if (typeof process !== \"undefined\" && typeof process.versions === \"object\" && !!process.versions.electron) {\n        return true;\n    }\n    // Detect the user agent when the `nodeIntegration` option is set to false\n    if (typeof navigator === \"object\" && typeof navigator.userAgent === \"string\" && navigator.userAgent.indexOf(\"Electron\") >= 0) {\n        return true;\n    }\n    return false;\n}\nmodule.exports = isElectron;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi4vbm9kZV9tb2R1bGVzL2lzLWVsZWN0cm9uL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBLG1EQUFtRDtBQUNuRCxTQUFTQTtJQUNMLG1CQUFtQjtJQUNuQixJQUFJLEtBQStGLEVBQVksRUFFOUc7SUFFRCxlQUFlO0lBQ2YsSUFBSSxPQUFPRSxZQUFZLGVBQWUsT0FBT0EsUUFBUUUsUUFBUSxLQUFLLFlBQVksQ0FBQyxDQUFDRixRQUFRRSxRQUFRLENBQUNDLFFBQVEsRUFBRTtRQUN2RyxPQUFPO0lBQ1g7SUFFQSwwRUFBMEU7SUFDMUUsSUFBSSxPQUFPQyxjQUFjLFlBQVksT0FBT0EsVUFBVUMsU0FBUyxLQUFLLFlBQVlELFVBQVVDLFNBQVMsQ0FBQ0MsT0FBTyxDQUFDLGVBQWUsR0FBRztRQUMxSCxPQUFPO0lBQ1g7SUFFQSxPQUFPO0FBQ1g7QUFFQUMsT0FBT0MsT0FBTyxHQUFHViIsInNvdXJjZXMiOlsid2VicGFjazovL2FpLWludGVyZmFjZS1mcm9udGVuZC8uLi9ub2RlX21vZHVsZXMvaXMtZWxlY3Ryb24vaW5kZXguanM/ZDJjZiJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBodHRwczovL2dpdGh1Yi5jb20vZWxlY3Ryb24vZWxlY3Ryb24vaXNzdWVzLzIyODhcbmZ1bmN0aW9uIGlzRWxlY3Ryb24oKSB7XG4gICAgLy8gUmVuZGVyZXIgcHJvY2Vzc1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93LnByb2Nlc3MgPT09ICdvYmplY3QnICYmIHdpbmRvdy5wcm9jZXNzLnR5cGUgPT09ICdyZW5kZXJlcicpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gTWFpbiBwcm9jZXNzXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyA9PT0gJ29iamVjdCcgJiYgISFwcm9jZXNzLnZlcnNpb25zLmVsZWN0cm9uKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIERldGVjdCB0aGUgdXNlciBhZ2VudCB3aGVuIHRoZSBgbm9kZUludGVncmF0aW9uYCBvcHRpb24gaXMgc2V0IHRvIGZhbHNlXG4gICAgaWYgKHR5cGVvZiBuYXZpZ2F0b3IgPT09ICdvYmplY3QnICYmIHR5cGVvZiBuYXZpZ2F0b3IudXNlckFnZW50ID09PSAnc3RyaW5nJyAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0VsZWN0cm9uJykgPj0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNFbGVjdHJvbjtcbiJdLCJuYW1lcyI6WyJpc0VsZWN0cm9uIiwid2luZG93IiwicHJvY2VzcyIsInR5cGUiLCJ2ZXJzaW9ucyIsImVsZWN0cm9uIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiaW5kZXhPZiIsIm1vZHVsZSIsImV4cG9ydHMiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/../node_modules/is-electron/index.js\n");

/***/ })

};
;