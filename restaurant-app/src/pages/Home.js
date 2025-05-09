import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../UserContext';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Lokalisatsioonifunktsioon
  const { user, isAuthenticated } = useContext(UserContext); // Kasutaja andmed ja autentimine

  useEffect(() => {
    const cards = document.querySelectorAll('.animate-on-scroll'); // Kõik kaardid, mis liiguvad sisse
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Kui kaart on nähtav, lisatakse 'visible' klass
          }
        });
      },
      { threshold: 0.2 } // 20% kaardist peab olema nähtav
    );

    cards.forEach(card => observer.observe(card)); // Vaadatakse, kas kaardid on nähtavad
    return () => cards.forEach(card => observer.unobserve(card)); // Puhastame vaatlejad
  }, []);

  return (
    <>
      <header
        className="header"
        style={{ backgroundImage: "url('/images/tallinn-header.jpg')" }} // Taustapilt
      >
        <div className="overlay">
          <h1>{t('welcome')}</h1> {/* Tervitus tekst */}
          <p>{t('discover')}</p> {/* Avastamis tekst */}
        </div>
      </header>

      <section className="info-section">
        {/* Infokaart 1 */}
        <div className="info-card animate-on-scroll">
          <div
            className="card-bg"
            style={{ backgroundImage: "url('/images/tallinn-about.jpg')" }} // Taustapilt
          ></div>
          <div className="card-content">
            <h2>{t('aboutTitle')}</h2> {/* "Teave" pealkiri */}
            <p>{t('aboutText')}</p> {/* "Teave" tekst */}
            <button className="explore-button" onClick={() => navigate('/map')}>
              {t('mapButton')} {/* Nupp, mis viib kaardile */}
            </button>
          </div>
        </div>

        {/* Infokaart 2 */}
        <div className="info-card animate-on-scroll">
          <video autoPlay loop muted className="card-video">
            <source src="/videos/estonia-flag.mp4" type="video/mp4" />
          </video>
          <div className="card-content">
            {/* Kasutaja tervitamine kui on sisse logitud */}
            {isAuthenticated ? (
              <>
                <h2>{t('welcomeUser', { name: user?.username })}</h2> {/* Tervitus kasutaja nimega */}
                <p>{t('thankYou')}</p> {/* Täname, et oled liitunud */}
              </>
            ) : (
              <>
                <h2>{t('registerTitle')}</h2> {/* Registreerumise pealkiri */}
                <p>{t('registerText')}</p> {/* Registreerimise tekst */}
                <button className="explore-button" onClick={() => navigate('/register')}>
                  {t('registerButton')} {/* Nupp registreerimiseks */}
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
