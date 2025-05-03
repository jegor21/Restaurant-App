import React, { useEffect, useState, useCallback, useMemo } from "react";
import "./Restaurant.css";
import { useTranslation } from 'react-i18next';


function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  function Restaurants() {
    const { t } = useTranslation(); 
  

  const randomImages = useMemo(() => [
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17",
    "https://images.unsplash.com/photo-1497644083578-611b798c60f3",
    "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b",
    "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5",
    "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6",
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9",
    "https://images.unsplash.com/photo-1471253794676-0f039a6aae9d",
    "https://images.unsplash.com/photo-1488324346298-5ad3d8f96d0d",
    "https://images.unsplash.com/photo-1613946069412-38f7f1ff0b65",
    "https://images.unsplash.com/photo-1586999768265-24af89630739",
    "https://images.unsplash.com/photo-1560053608-13721e0d69e8",
    "https://images.unsplash.com/photo-1482275548304-a58859dc31b7",
    "https://images.unsplash.com/photo-1565650834520-0b48a5c83f43",
  ], []);

  const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/restaurants");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      let assignedImages = JSON.parse(localStorage.getItem("assignedImages")) || {};
      let availableImages = [...randomImages];

      const restaurantsWithImages = data.map((restaurant) => {
        if (!assignedImages[restaurant.id]) {
          const randomIndex = Math.floor(Math.random() * availableImages.length);
          assignedImages[restaurant.id] = availableImages[randomIndex] || fallbackImage;
          availableImages.splice(randomIndex, 1);
        }
        return {
          ...restaurant,
          randomImage: assignedImages[restaurant.id],
        };
      });

      localStorage.setItem("assignedImages", JSON.stringify(assignedImages));
      setRestaurants(restaurantsWithImages);

    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  }, [randomImages]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const openModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const closeModal = () => {
    setSelectedRestaurant(null);
  };

  const clearRestaurants = async () => {
    const confirmed = window.confirm("Вы уверены, что хотите удалить все рестораны?");
    if (!confirmed) return;

    try {
      const response = await fetch("http://localhost:5000/api/restaurants/clear", {
        method: "DELETE",
      });
      if (response.ok) {
        setRestaurants([]);
        localStorage.removeItem("assignedImages");
      } else {
        console.error("Failed to clear restaurants.");
      }
    } catch (error) {
      console.error("Error clearing restaurants:", error);
    }
  };

  const sortByRating = () => {
    const sorted = [...restaurants].sort((a, b) => b.rating - a.rating);
    setRestaurants(sorted);
  };

  const sortByReviews = () => {
    const sorted = [...restaurants].sort((a, b) => b.total_ratings - a.total_ratings);
    setRestaurants(sorted);
  };

  return (
    <div className="restaurant-page">
      <h2 className="restaurant-title">{t('restaurantsTitle')}</h2>

      <div className="button-panel">
        <button className="sort-button" onClick={sortByRating}>
          {t('sortByRating')}
        </button>
        <button className="clear-button" onClick={clearRestaurants}>
          {t('clearRestaurants')}
        </button>
        <button className="sort-button" onClick={sortByReviews}>
          {t('sortByReviews')}
        </button>
      </div>

      {loading ? (
        <p className="loading-text">{t('loading')}</p>
      ) : (
        <div className="restaurant-list">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="restaurant-card"
              onClick={() => openModal(restaurant)}
            >
              <img
                src={restaurant.randomImage || fallbackImage}
                alt={restaurant.name}
                className="restaurant-image"
                onError={(e) => { e.target.src = fallbackImage; }}
              />
              <h3>{restaurant.name}</h3>
            </div>
          ))}
        </div>
      )}

      {selectedRestaurant && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>×</button>
            <img
              src={selectedRestaurant.randomImage || fallbackImage}
              alt={selectedRestaurant.name}
              className="modal-image"
              onError={(e) => { e.target.src = fallbackImage; }}
            />
            <h2>{selectedRestaurant.name}</h2>
            <p><strong>ID:</strong> {selectedRestaurant.id}</p>
            <p><strong>Place ID:</strong> {selectedRestaurant.place_id}</p>
            <p><strong>{t('coordinates')}:</strong> {selectedRestaurant.lat}, {selectedRestaurant.lng}</p>
            <p><strong>{t('address')}:</strong> {selectedRestaurant.address}</p>
            <p><strong>{t('rating')}:</strong> {selectedRestaurant.rating} ({selectedRestaurant.total_ratings} {t('reviews')})</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restaurants;