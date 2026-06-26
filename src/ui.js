// src/ui.js
// Handles start button, requests camera permission, displays errors

import { startAR } from './main.js';

export function initUI() {
  const startButton = document.getElementById('start-button');
  const errorDiv = document.getElementById('error-message');

  if (!startButton) {
    console.error('Start button not found');
    return;
  }
  if (!errorDiv) {
    console.error('Error message div not found');
    return;
  }

  startButton.addEventListener('click', async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      errorDiv.textContent = '';
      // Permission granted – start AR experience
      await startAR();
      // Hide the start button after AR begins
      startButton.style.display = 'none';
    } catch (err) {
      console.error('Camera permission error:', err);
      errorDiv.textContent = 'Camera permission denied or unavailable.';
    }
  });
}
