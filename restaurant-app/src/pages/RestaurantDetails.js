import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./../styles/RestaurantDetails.css";

const RestaurantDetails = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/restaurants/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRestaurant(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [id]);

  if (loading) {
    return <p className="loading-text">Загрузка данных ресторана...</p>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Ошибка: {error}</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="error-message">
        <p>Ресторан не найден</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  return (
    <div className="restaurant-details">
      <button onClick={() => navigate(-1)} className="back-button">Назад</button>
      <h2>{restaurant.name}</h2>
      {/* <img
        src={restaurant.photos?.[0] || ""}
        alt={restaurant.name}
        className="details-image"
        onError={(e) => { e.target.src = ""; }}
      /> */}
      <p><strong>ID:</strong> {restaurant.id}</p>
      <p><strong>Place ID:</strong> {restaurant.place_id}</p>
      <p><strong>Координаты:</strong> {restaurant.lat}, {restaurant.lng}</p>
      <p><strong>Адрес:</strong> {restaurant.address}</p>
      <p><strong>Рейтинг:</strong> {restaurant.rating} ({restaurant.total_ratings} отзывов)</p>
    </div>
  );
};

export default RestaurantDetails;