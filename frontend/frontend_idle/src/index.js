
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
if (!window.__fetchHooked) {
  const _fetch = window.fetch;
  window.fetch = async (...args) => {
    console.log("[FETCH][REQ]", args[0], args[1]);
    try {
      const res = await _fetch(...args);
      console.log("[FETCH][RES]", res.status, res.url);
      return res;
    } catch (e) {
      console.log("[FETCH][ERR]", e);
      throw e;
    }
  };
  window.__fetchHooked = true;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
