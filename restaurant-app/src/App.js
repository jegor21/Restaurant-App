import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Restaurants from './components/Restaurants';
import RestaurantDetails from "./pages/RestaurantDetails";
import './styles/index.css';
import Map from './components/Map';
import Login from './pages/Login';
import PasswordRecovery from './pages/PasswordRecovery';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider, UserContext } from './UserContext';
import PasswordReset from './pages/PasswordReset';
import EmailConfirmationSuccess from './pages/EmailConfirmationSuccess';


function App() {
  return (
    <UserProvider>
      <Router>
        <div className="app">
          <nav className="navbar">
            <div className="logo">RestaurantApp</div>
            <ul className="nav-links">
              <li><Link to="/">Main</Link></li>
              <li><Link to="/restaurants">Restaurant</Link></li>
              <li><Link to="/map">Map</Link></li>
              <UserContext.Consumer>
                {({ isAuthenticated, user, logout }) => (
                  isAuthenticated ? (
                    <>
                      <li>Hello, {user?.username}!</li>
                      <li><button onClick={logout} className="logout-button">Logout</button></li>
                    </>
                  ) : (
                    <>
                      <li><Link to="/login">Login</Link></li>
                      <li><Link to="/register">Register</Link></li>
                    </>
                  )
                )}
              </UserContext.Consumer>
            </ul>
          </nav>

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetails />} />
            <Route path="/map" element={
              <UserContext.Consumer>
                {({ isAuthenticated }) => (
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Map />
                  </ProtectedRoute>
                )}
              </UserContext.Consumer>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/password-recovery" element={<PasswordRecovery />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/register" element={<Register />} />
            <Route path="/email-confirmation-success" element={<EmailConfirmationSuccess />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
