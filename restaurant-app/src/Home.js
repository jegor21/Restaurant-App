import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';

function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const cards = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach(card => observer.observe(card));

    return () => {
      cards.forEach(card => observer.unobserve(card));
    };
  }, []);

  return (
    <>
      <header className="header" style={{ backgroundImage: "url('/images/tallinn-header.jpg')" }}>
        <div className="overlay">
          <h1>Добро пожаловать в RestaurantApp</h1>
          <p>Откройте для себя лучшие рестораны Таллинна</p>
        </div>
      </header>

      <section className="info-section">
        <div className="info-card animate-on-scroll">
          <div className="card-bg" style={{ backgroundImage: "url('/images/tallinn-about.jpg')" }}></div>
          <div className="card-content">
            <h2>О проекте</h2>
            <p>
              RestaurantApp помогает вам находить лучшие рестораны поблизости. Просто выберите точку на карте, и
              приложение покажет вам рестораны в этом районе. Идеально для тех, кто любит открывать новые места!
            </p>
            <button className="explore-button" onClick={() => navigate('/map')}>
              Перейти к карте
            </button>
          </div>
        </div>

        <div className="info-card animate-on-scroll">
          <video autoPlay loop muted className="card-video">
            <source src="/videos/estonia-flag.mp4" type="video/mp4" />
          </video>
          <div className="card-content">
            <h2>Регистрация</h2>
            <p>
              Зарегистрируйтесь, чтобы сохранять любимые рестораны, оставлять отзывы 
              и получать персональные рекомендации.
            </p>
            <button className="explore-button" onClick={() => navigate('/register')}>
              Зарегистрироваться
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
