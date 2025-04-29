import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';

function Home() {
  const navigate = useNavigate();

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
          <h1>Добро пожаловать в RestaurantApp</h1>
          <p>Откройте для себя лучшие рестораны Таллинна</p>
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
            RestaurantApp помогает вам находить лучшие рестораны поблизости. 
            Просто выберите точку на карте, и приложение автоматически покажет вам рестораны в этом районе. 
            Идеально для тех, кто любит открывать новые места!
          </p>

          <div className="button-container">
            <button className="explore-button" onClick={() => navigate('/map')}>
              Перейти к карте
            </button>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} RestaurantApp. Все права защищены.</p>
      </footer>
    </>
  );
}

export default Home;
