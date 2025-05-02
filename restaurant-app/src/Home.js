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

      <section className="info-section">
        <div className="info-card animate-on-scroll">
          <div className="card-bg" style={{ backgroundImage: "url('/images/tallinn-about.jpg')" }}></div>
          <div className="card-content">
            <h2>About the Project</h2>
            <p>
              RestaurantApp helps you find the best restaurants nearby. Just pick a point on the map and the app
              will show you what's around. Perfect for those who love discovering new places!
            </p>
            <button className="explore-button" onClick={() => navigate('/map')}>
              Go to Map
            </button>
          </div>
        </div>

        <div className="info-card animate-on-scroll">
          <video autoPlay loop muted className="card-video">
            <source src="/videos/estonia-flag.mp4" type="video/mp4" />
          </video>
          <div className="card-content">
            <h2>Registration</h2>
            <p>
              Register to save your favorite restaurants, leave reviews, and get personalized recommendations.
            </p>
            <button className="explore-button" onClick={() => navigate('/register')}>
              Register
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
