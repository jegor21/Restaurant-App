import React from 'react';
import './Home.css';

function Home() {
  return (
    <>
      <header className="header">
        <h1>Добро пожаловать в RestaurantApp</h1>
        <p>Откройте для себя лучшие рестораны Таллинна</p>
      </header>

      <section className="about">
        <h2>О проекте</h2>
        <p>
          RestaurantApp создан для любителей хорошей еды. Здесь вы можете найти список лучших ресторанов Таллинна, 
          посмотреть их расположение на карте, прочитать описание и выбрать место по душе.
        </p>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} RestaurantApp. Все права защищены.</p>
      </footer>
    </>
  );
}

export default Home;
