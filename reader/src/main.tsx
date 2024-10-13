import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // Import the main App component
     // Optionally include global styles

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />  {/* Render the App component */}
  </React.StrictMode>,
);
