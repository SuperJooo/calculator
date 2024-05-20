// script.js

const displayElement = document.getElementById('display');
let displayValue = '0';
let awaitingNextValue = false;
let operator = null;
let firstValue = null;

function appendValue(value) {
    if (awaitingNextValue) {
        displayValue = value;
        awaitingNextValue = false;
    } else {
        displayValue = displayValue === '0' ? value : displayValue + value;
    }
    updateDisplay();
}

function updateDisplay() {
    displayElement.innerText = displayValue;
}

function clearDisplay() {
    displayValue = '0';
    awaitingNextValue = false;
    operator = null;
    firstValue = null;
    updateDisplay();
}

function deleteLast() {
    displayValue = displayValue.slice(0, -1) || '0';
    updateDisplay();
}

function calculateResult() {
    if (firstValue === null || operator === null) return;

    const secondValue = parseFloat(displayValue);
    switch (operator) {
        case '+':
            displayValue = (firstValue + secondValue).toString();
            break;
        case '-':
            displayValue = (firstValue - secondValue).toString();
            break;
        case '*':
            displayValue = (firstValue * secondValue).toString();
            break;
        case '/':
            displayValue = (firstValue / secondValue).toString();
            break;
    }

    operator = null;
    firstValue = null;
    awaitingNextValue = true;
    updateDisplay();
}

function setOperator(op) {
    if (operator !== null) calculateResult();

    firstValue = parseFloat(displayValue);
    operator = op;
    awaitingNextValue = true;
}

document.querySelector('.buttons').addEventListener('click', (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const value = target.innerText;

    if (!target.classList.contains('btn')) return;

    switch (action) {
        case 'number':
            appendValue(value);
            break;
        case 'operator':
            setOperator(value);
            break;
        case 'decimal':
            if (!displayValue.includes('.')) appendValue('.');
            break;
        case 'clear':
            clearDisplay();
            break;
        case 'delete':
            deleteLast();
            break;
        case 'calculate':
            calculateResult();
            break;
    }
});

document.getElementById('theme-switch').addEventListener('change', () => {
    document.body.classList.toggle('night');
});
