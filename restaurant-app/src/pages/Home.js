import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../UserContext';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useContext(UserContext);

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
    return () => cards.forEach(card => observer.unobserve(card));
  }, []);

  return (
    <>
      <header
        className="header"
        style={{ backgroundImage: "url('/images/tallinn-header.jpg')" }}
      >
        <div className="overlay">
          <h1>{t('welcome')}</h1>
          <p>{t('discover')}</p>
        </div>
      </header>

      <section className="info-section">
        <div className="info-card animate-on-scroll">
          <div
            className="card-bg"
            style={{ backgroundImage: "url('/images/tallinn-about.jpg')" }}
          ></div>
          <div className="card-content">
            <h2>{t('aboutTitle')}</h2>
            <p>{t('aboutText')}</p>
            <button className="explore-button" onClick={() => navigate('/map')}>
              {t('mapButton')}
            </button>
          </div>
        </div>

        <div className="info-card animate-on-scroll">
          <video autoPlay loop muted className="card-video">
            <source src="/videos/estonia-flag.mp4" type="video/mp4" />
          </video>
          <div className="card-content">
            {isAuthenticated ? (
              <>
                <h2>{t('welcomeUser', { name: user?.username })}</h2>
                <p>{t('thankYou')}</p>

              </>
            ) : (
              <>
                <h2>{t('registerTitle')}</h2>
                <p>{t('registerText')}</p>
                <button className="explore-button" onClick={() => navigate('/register')}>
                  {t('registerButton')}
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
