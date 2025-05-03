import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

import './i18n'; // ← должен быть ДО App
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

import App from './App';
import { UserProvider } from './UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <UserProvider>
        <App />
      </UserProvider>
    </I18nextProvider>
  </React.StrictMode>
);
