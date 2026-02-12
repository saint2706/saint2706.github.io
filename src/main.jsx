import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';
// 🎉 Easter egg for curious developers and recruiters!
if (import.meta.env.DEV) {
  console.log(
    `%c
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   👋 Hey there, curious one!                                 ║
    ║                                                              ║
    ║   Since you're peeking under the hood, you clearly have      ║
    ║   great taste in code. Want to see more?                     ║
    ║                                                              ║
    ║   🔗 GitHub: https://github.com/saint2706                    ║
    ║   💼 LinkedIn: Let's connect!                                ║
    ║   ☕ Buy me a coffee if you liked what you saw!              ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    `,
    'color: #38bdf8; font-family: monospace; font-size: 11px; line-height: 1.5;'
  );

  console.log(
    '%c🚀 Open to opportunities! ',
    'background: linear-gradient(90deg, #ec4899, #38bdf8); color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; font-size: 14px;'
  );

  console.log(
    '%cBuilt with React, Tailwind CSS, and lots of ☕',
    'color: #94a3b8; font-style: italic;'
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
