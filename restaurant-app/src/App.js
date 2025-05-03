import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Home from './Home';
import Restaurants from './components/Restaurants';
import RestaurantDetails from "./pages/RestaurantDetails";
import Map from './components/Map';
import Login from './pages/Login';
import PasswordRecovery from './pages/PasswordRecovery';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { UserContext } from './UserContext';
import PasswordReset from './pages/PasswordReset';
import AdminPage from "./pages/AdminPage";
import ManageComments from "./pages/ManageComments";
import EmailConfirmationSuccess from './pages/EmailConfirmationSuccess';

import './styles/index.css';

function App() {
  const { user, isAuthenticated, logout } = useContext(UserContext);
  const { t, i18n } = useTranslation();

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-left">
            <div className="logo">🍽️ RestaurantApp
            <div className="lang-switcher">
            <button onClick={() => i18n.changeLanguage('en')}>EN</button>
            <button onClick={() => i18n.changeLanguage('ru')}>RU</button>
            </div>
          </div>
          </div>

          <ul className="nav-links">
            <li><Link to="/">{t('main')}</Link></li>
            <li><Link to="/restaurants">{t('restaurant')}</Link></li>
            <li><Link to="/map">{t('map')}</Link></li>
            {user?.role === "admin" && (
              <li><Link to="/admin">{t('admin')}</Link></li>
            )}
            {isAuthenticated ? (
              <>
                <li className="welcome-user">{t('welcomeUser')}, {user?.username}</li>
                <li><button onClick={logout} className="logout-button">{t('logout')}</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">{t('login')}</Link></li>
                <li><Link to="/register">{t('register')}</Link></li>
              </>
            )}
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:place_id" element={<RestaurantDetails />} />
            <Route
              path="/map"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Map />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-confirmation-success" element={<EmailConfirmationSuccess />} />
            <Route path="*" element={<div>404 Not Found</div>} />
            {user?.role === "admin" && <Route path="/admin" element={<AdminPage />} />}
            {user?.role === "admin" && <Route path="/admin/comments" element={<ManageComments />} />}
          </Routes>
        </main>

        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} RestaurantApp. All rights reserved. 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
