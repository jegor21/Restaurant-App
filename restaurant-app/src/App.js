import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Restaurants from './Restaurants';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="logo">🍽️ RestaurantApp</div>
          <ul className="nav-links">
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/restaurants">Рестораны</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
