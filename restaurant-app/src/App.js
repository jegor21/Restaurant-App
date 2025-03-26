import React from 'react';
import Home from './Home';
import './index.css';

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">🍽️ RestaurantApp</div>
        <ul className="nav-links">
          <li><a href="/">Главная</a></li>
          <li><a href="/restaurants">Рестораны</a></li>
        </ul>
      </nav>

      <Home />
    </div>
  );
}

export default App;
