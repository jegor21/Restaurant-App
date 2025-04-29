import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Restaurants from './components/Restaurants';
import RestaurantDetails from "./pages/RestaurantDetails";
import './styles/index.css';
import Map from './components/Map';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="logo">RestaurantApp</div>
          <ul className="nav-links">
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/restaurants">Рестораны</Link></li>
            <li><Link to="/map">test MAP</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/Map" element={<Map />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
