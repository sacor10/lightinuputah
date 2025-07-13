import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import HerokuMonitoringService from './services/herokuMonitoringService';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize Heroku monitoring service
if (process.env.NODE_ENV === 'production') {
  HerokuMonitoringService.getInstance();
}

// Enhanced web vitals reporting with Heroku integration
reportWebVitals();
