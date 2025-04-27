import React, { useEffect, useState } from "react";
import "./Restaurant.css";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const randomImages = [
    "https://images.unsplash.com/photo-1600891964599-f61ba0e24092",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    "https://images.unsplash.com/photo-1589927986089-35812388d1a0",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
  ];

  const getRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * randomImages.length);
    return randomImages[randomIndex];
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/restaurants");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const restaurantsWithImages = data.map((restaurant) => ({
        ...restaurant,
        randomImage: getRandomImage(),
      }));

      setRestaurants(restaurantsWithImages);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

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
        setRestaurants([]); // Очистка локального списка
      } else {
        console.error("Failed to clear restaurants.");
      }
    } catch (error) {
      console.error("Error clearing restaurants:", error);
    }
  };

  return (
    <div className="restaurant-page">
      <h2 className="restaurant-title">Рестораны в Таллине</h2>

      <div className="button-wrapper">
        <button className="clear-button" onClick={clearRestaurants}>
          Очистить рестораны
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Загрузка ресторанов...</p>
      ) : (
        <div className="restaurant-list">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="restaurant-card"
              onClick={() => openModal(restaurant)}
            >
              <img
                src={restaurant.randomImage}
                alt={restaurant.name}
                className="restaurant-image"
              />
              <h3>{restaurant.name}</h3>
            </div>
          ))}
        </div>
      )}

      {selectedRestaurant && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              ×
            </button>

            <img
              src={selectedRestaurant.randomImage}
              alt={selectedRestaurant.name}
              className="modal-image"
            />

            <h2>{selectedRestaurant.name}</h2>
            <p><strong>ID:</strong> {selectedRestaurant.id}</p>
            <p><strong>Place ID:</strong> {selectedRestaurant.place_id}</p>
            <p><strong>Координаты:</strong> {selectedRestaurant.lat}, {selectedRestaurant.lng}</p>
            <p><strong>Адрес:</strong> {selectedRestaurant.address}</p>
            <p><strong>Рейтинг:</strong> {selectedRestaurant.rating} ({selectedRestaurant.total_ratings} отзывов)</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Restaurants;
