import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import "./../styles/Restaurant.css";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h2 className="restaurant-title">Рестораны в Таллине</h2>

      <div className="button-panel">
        <button className="sort-button" onClick={sortByRating}>
          Сортировать по рейтингу ⭐
        </button>

        <button className="sort-button" onClick={sortByReviews}>
          Сортировать по отзывам 💬
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading restaurants...</p>
      ) : (
        <div className="restaurant-list">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="restaurant-card">
              <img
                src={restaurant.randomImage || fallbackImage}
                alt={restaurant.name}
                className="restaurant-image"
                onError={(e) => { e.target.src = fallbackImage; }}
              />
              <h3>{restaurant.name}</h3>
              <Link to={`/restaurants/${restaurant.id}`}>
                <button className="details-button">Details</button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Restaurants;