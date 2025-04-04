import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthContextProvider } from './context/AuthContext';
import { DarkModeContextProvider } from './context/darkModeContext';
import { SnackbarProvider } from 'notistack';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <SnackbarProvider maxSnack={3}>
    <React.StrictMode>
      <AuthContextProvider>
        <DarkModeContextProvider>
          <App />
        </DarkModeContextProvider>
      </AuthContextProvider>
    </React.StrictMode>
  </SnackbarProvider>
);