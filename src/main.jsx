import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import App from './App.jsx';
import { ThemeProvider } from './components/shared/ThemeProvider.jsx';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);
