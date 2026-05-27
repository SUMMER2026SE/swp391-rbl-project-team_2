import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import CONFIG from './config';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider 
      clientId={CONFIG.GOOGLE_CLIENT_ID || "1036266187794-2kcf2tv8bkdjac9n5rd8bj2k8hoh2qr8.apps.googleusercontent.com"}
      locale="en"
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
