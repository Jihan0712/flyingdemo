import { jest } from '@jest/globals';
import { initUI } from '../src/ui.js';

describe('UI start button', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <button id="start-button"></button>
      <div id="error-message"></div>
    `;
    // mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: jest.fn().mockResolvedValue({}),
    };
  });

  test('click triggers getUserMedia', async () => {
    initUI();
    const btn = document.getElementById('start-button');
    btn.click();
    // wait for async handler
    await Promise.resolve();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true });
    expect(document.getElementById('error-message').textContent).toBe('');
  });

  test('error displays on permission denial', async () => {
    navigator.mediaDevices.getUserMedia.mockRejectedValue(new Error('Denied'));
    initUI();
    document.getElementById('start-button').click();
    await Promise.resolve();
    expect(document.getElementById('error-message').textContent).toBe('Camera permission denied or unavailable.');
  });
});
