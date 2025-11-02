// Sample JavaScript file for testing the AI Code Review System
// This file contains various code issues that should be detected

// Bug: Using var instead of let/const
var globalCounter = 0;

// Bug: Loose equality comparison
function checkValue(value) {
  if (value == null) {
    return false;
  }
  return true;
}

// Security: XSS vulnerability
function displayUserInput(input) {
  document.getElementById('output').innerHTML = input;
}

// Security: Using eval
function executeCode(code) {
  eval(code);
}

// Security: Logging sensitive information
function authenticateUser(username, password) {
  console.log('Attempting login with password:', password);
  return true;
}

// Performance: Inefficient loop
function processLargeArray(items) {
  for (var i = 0; i < items.length; i++) {
    for (var j = 0; j < items.length; j++) {
      console.log(items[i], items[j]);
    }
  }
}

// Quality: Line too long
const veryLongVariableNameThatExceedsTheRecommendedLineLengthAndShouldBeBrokenIntoMultipleLinesForBetterReadability = true;

// Quality: TODO comment
function calculateTotal(items) {
  // TODO: Add validation for items array
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

// Quality: FIXME comment
function deprecatedFunction() {
  // FIXME: This function is deprecated and should be removed
  return "old implementation";
}

// Documentation: Missing function documentation
function complexCalculation(a, b, c) {
  return (a * b) + (c / 2) - Math.sqrt(a);
}

// Multiple issues in one function
function problematicFunction(userInput) {
  var result = "";
  
  if (userInput == undefined) {
    return null;
  }
  
  // Security issue
  document.body.innerHTML = userInput;
  
  // Performance issue
  for (var i = 0; i < userInput.length; i++) {
    result += userInput[i];
  }
  
  // TODO: Optimize this
  return result;
}

// Export for testing
module.exports = {
  checkValue,
  displayUserInput,
  executeCode,
  authenticateUser,
  processLargeArray,
  calculateTotal,
  deprecatedFunction,
  complexCalculation,
  problematicFunction
};
