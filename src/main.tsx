import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Guard against third-party cross-origin script errors (e.g., Disqus, tracking blockers, iframe sandboxes)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const isScriptError = event.message === 'Script error.' || event.message === '';
    const isDisqusOrExternal =
      event.filename?.includes('disqus') ||
      event.filename?.includes('doubleclick') ||
      event.filename?.includes('google');

    if (isScriptError || isDisqusOrExternal) {
      console.warn('Suppressed external cross-origin script error:', event.message, event.filename);
      event.preventDefault();
      return true;
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (reason.includes('disqus') || reason.includes('Script error') || reason.includes('blocked')) {
      console.warn('Suppressed unhandled external rejection:', reason);
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
