import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import { FeedProvider } from './context/FeedContext';

// CSS Imports
import './assets/css/bootstrap.min.css'
import './assets/css/common.css'
import './assets/css/main.css'
import './assets/css/responsive.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FeedProvider>
            <App />
        </FeedProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)