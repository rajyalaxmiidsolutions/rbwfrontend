import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#FFFFFF',
                color: '#222222',
                border: '1px solid #E8E8E8',
                borderRadius: '18px',
                fontSize: '14px',
                padding: '12px 20px',
              },
              success: { iconTheme: { primary: '#6D0F1A', secondary: '#FFFFFF' } },
              error: { iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
