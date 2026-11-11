/**
 * Minimalist Calculator Logic
 * Maintains calculator state and handles user interactions.
 */

// --- 1. State Variables ---
let currentInput = "0";      // The number currently being entered
let previousInput = "";      // The previous number saved before selecting an operator
let currentOperator = null;  // The selected operation (+, -, ×, ÷)
let resetNextInput = false;  // Flag to wipe screen when typing starts after selecting an operator or result

// --- 2. DOM Elements ---
const currentDisplay = document.getElementById("current-operand");
const previousDisplay = document.getElementById("previous-operand");
const buttonsContainer = document.querySelector(".buttons-grid");

// --- 3. Core Calculator Functions ---

/**
 * Appends a digit (0-9) to the current number string.
 */
function appendNumber(number) {
  // If a calculation just finished or an operator was clicked, start fresh
  if (currentInput === "0" || resetNextInput) {
    currentInput = number;
    resetNextInput = false;
  } else {
    // Prevent excessively long inputs that overflow the screen
    if (currentInput.length >= 12) return;
    currentInput += number;
  }
  updateDisplay();
}

/**
 * Adds a decimal point if one does not already exist.
 */
function appendDecimal() {
  if (resetNextInput) {
    currentInput = "0.";
    resetNextInput = false;
    updateDisplay();
    return;
  }

  // Prevent multiple decimal points in one number (e.g., "3.14.15")
  if (!currentInput.includes(".")) {
    currentInput += ".";
    updateDisplay();
  }
}

/**
 * Selects an arithmetic operator (+, -, ×, ÷).
 */
function chooseOperator(operator) {
  // If user changes their mind and presses another operator before entering a second number
  if (currentOperator !== null && resetNextInput) {
    currentOperator = operator;
    updateDisplay();
    return;
  }

  // If there is already a previous operand queued, compute the intermediate result first
  if (previousInput !== "") {
    calculate();
  }

  currentOperator = operator;
  previousInput = currentInput;
  resetNextInput = true;
  updateDisplay();
}

/**
 * Performs the arithmetic calculation based on state.
 */
function calculate() {
  // Cannot calculate without an operator or previous operand
  if (currentOperator === null || resetNextInput) return;

  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);

  if (isNaN(prev) || isNaN(current)) return;

  let result;
  switch (currentOperator) {
    case "+":
      result = prev + current;
      break;
    case "−":
    case "-":
      result = prev - current;
      break;
    case "×":
    case "*":
      result = prev * current;
      break;
    case "÷":
    case "/":
      // Handle division by zero
      if (current === 0) {
        currentInput = "Error";
        previousInput = "";
        currentOperator = null;
        resetNextInput = true;
        updateDisplay();
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }

  // Fix JavaScript floating point quirks (e.g. 0.1 + 0.2 = 0.30000000000000004)
  currentInput = roundResult(result).toString();
  currentOperator = null;
  previousInput = "";
  resetNextInput = true;
  updateDisplay();
}

/**
 * Rounds numbers to prevent overflow and decimal inaccuracies.
 */
function roundResult(num) {
  return Math.round(num * 100000000) / 100000000;
}

/**
 * Clears all state (AC button).
 */
function clearAll() {
  currentInput = "0";
  previousInput = "";
  currentOperator = null;
  resetNextInput = false;
  updateDisplay();
}

/**
 * Toggles positive/negative sign (± button).
 */
function toggleSign() {
  if (currentInput === "0" || currentInput === "Error") return;
  currentInput = (parseFloat(currentInput) * -1).toString();
  updateDisplay();
}

/**
 * Converts current number into a percentage (% button).
 */
function applyPercentage() {
  if (currentInput === "Error") return;
  currentInput = (parseFloat(currentInput) / 100).toString();
  updateDisplay();
}

/**
 * Syncs JavaScript state values to the screen HTML.
 */
function updateDisplay() {
  currentDisplay.textContent = currentInput;

  if (currentOperator !== null) {
    previousDisplay.textContent = `${previousInput} ${currentOperator}`;
  } else {
    previousDisplay.textContent = "";
  }
}

// --- 4. Event Handling (Event Delegation) ---

/**
 * Instead of adding separate event listeners to every single button,
 * we listen on the parent container and check which button was clicked.
 */
buttonsContainer.addEventListener("click", (event) => {
  // Find the closest button that was clicked
  const button = event.target.closest("button");
  if (!button) return;

  // 1. Number keys
  if (button.dataset.number) {
    appendNumber(button.dataset.number);
    return;
  }

  // 2. Operator keys (+, -, ×, ÷)
  if (button.dataset.operator) {
    chooseOperator(button.dataset.operator);
    return;
  }

  // 3. Action keys (AC, ±, %, =, .)
  const action = button.dataset.action;
  switch (action) {
    case "clear":
      clearAll();
      break;
    case "decimal":
      appendDecimal();
      break;
    case "calculate":
      calculate();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    case "percent":
      applyPercentage();
      break;
  }
});

