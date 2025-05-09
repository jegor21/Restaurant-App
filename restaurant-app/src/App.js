import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Home from './pages/Home';
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
  const { user, isAuthenticated, logout } = useContext(UserContext); // Kasutaja ja autentimise kontroll
  const { t, i18n } = useTranslation(); // Lokalisatsioon

  return (
    <Router>
      <div className="app">
        {/* Navigeerimisbar */}
        <nav className="navbar">
          <div className="navbar-left">
            <div className="logo">🍽️ RestaurantApp
              {/* Keelerakenduse valik */}
              <div className="lang-switcher">
                <button onClick={() => i18n.changeLanguage('en')}>EN</button>
                <button onClick={() => i18n.changeLanguage('ru')}>RU</button>
              </div>
            </div>
          </div>

          {/* Navigeerimislinkide loetelu */}
          <ul className="nav-links">
            <li><Link to="/">{t('main')}</Link></li> {/* Peamine leht */}
            <li><Link to="/restaurants">{t('restaurant')}</Link></li> {/* Restoranide leht */}
            <li><Link to="/map">{t('map')}</Link></li> {/* Kaardileht */}
            {user?.role === "admin" && ( // Admin õigustega kasutajale lisatakse admin leht
              <li><Link to="/admin">{t('admin')}</Link></li>
            )}
            {/* Kui kasutaja on sisse logitud, kuvatakse tervitus ja väljumise nupp */}
            {isAuthenticated ? (
              <>
                <li className="welcome-user">{t('welcomeUser')}, {user?.username}</li>
                <li><button onClick={logout} className="logout-button">{t('logout')}</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">{t('login')}</Link></li> {/* Logi sisse link */}
                <li><Link to="/register">{t('register')}</Link></li> {/* Registreeri link */}
              </>
            )}
          </ul>
        </nav>

        {/* Peamine sisu, kus renderdatakse erinevad lehed */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} /> {/* Kodu leht */}
            <Route path="/restaurants" element={<Restaurants />} /> {/* Restoranide loend */}
            <Route path="/restaurants/:place_id" element={<RestaurantDetails />} /> {/* Restorani detailid */}
            {/* Kaart on kaitstud leht, kus ainult autentitud kasutajad saavad juurde pääseda */}
            <Route
              path="/map"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Map />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} /> {/* Logi sisse leht */}
            <Route path="/password-recovery" element={<PasswordRecovery />} /> {/* Parooli taastamise leht */}
            <Route path="/password-reset" element={<PasswordReset />} /> {/* Parooli lähtestamise leht */}
            <Route path="/register" element={<Register />} /> {/* Registreerimise leht */}
            <Route path="/email-confirmation-success" element={<EmailConfirmationSuccess />} /> {/* E-maili kinnitamine */}
            <Route path="*" element={<div>404 Not Found</div>} /> {/* 404 leht, kui teed vale päringu */}
            {user?.role === "admin" && <Route path="/admin" element={<AdminPage />} />} {/* Admin leht */}
            {user?.role === "admin" && <Route path="/admin/comments" element={<ManageComments />} />} {/* Kommenteerimise haldamine adminile */}
          </Routes>
        </main>

        {/* Jalus */}
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} RestaurantApp. All rights reserved. 2025</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
