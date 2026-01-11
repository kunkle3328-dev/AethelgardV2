
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global Error Hardening Patch
window.addEventListener('error', (event) => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="background: #111; color: #ff4444; padding: 2rem; font-family: 'Orbitron', monospace; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
        <h1 style="font-size: 1.5rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.2em;">Neural Link Failure</h1>
        <pre style="background: #000; padding: 1rem; border: 1px solid #333; border-radius: 0.5rem; max-width: 90%; white-space: pre-wrap; word-break: break-all; font-size: 0.8rem;">${event.message}\n\nLocation: ${event.filename}:${event.lineno}:${event.colno}</pre>
        <button onclick="window.location.reload()" style="margin-top: 2rem; background: #dc2626; color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; cursor: pointer; font-family: 'Orbitron', sans-serif; text-transform: uppercase; font-weight: bold;">Re-Initialize Core</button>
      </div>
    `;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);