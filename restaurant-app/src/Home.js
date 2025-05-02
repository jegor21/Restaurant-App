import React from 'react';
import './Home.css';

function Home() {
  return (
    <>
      <header
        className="header"
        style={{
          backgroundImage: "url('/images/tallinn-header.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="overlay">
          <h1>Welcome to RestaurantApp</h1>
          <p>Discover the best restaurants in Tallinn</p>
        </div>
      </header>

      <section 
        className="about" 
        style={{ 
          backgroundImage: "url('/images/tallinn-about.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        <div className="about-overlay">
          <h2>О проекте</h2>
          <p>
            RestaurantApp создан для любителей хорошей еды. Здесь вы можете найти список лучших ресторанов Таллинна,
            посмотреть их расположение на карте, прочитать описание и выбрать место по душе.
          </p>
        </div>
      </section>
    </>
  );
}

export default Home;
