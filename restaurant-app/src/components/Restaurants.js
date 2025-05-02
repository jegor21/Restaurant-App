import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./../styles/Restaurant.css";

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackImage = "/images/no-photo.jpg";

  const queryParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = useState(queryParams.get("search") || "");
  const [sortOption, setSortOption] = useState(queryParams.get("sort") || "name");
  const [sortOrder, setSortOrder] = useState(queryParams.get("order") || "desc");
  const [totalRestaurants, setTotalRestaurants] = useState(0);

  const randomImages = [
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe",
    "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38",
    "https://images.unsplash.com/photo-1505275350441-83dcda8eeef5",
    "https://images.unsplash.com/photo-1497644083578-611b798c60f3",
    "https://images.unsplash.com/photo-1585518419759-7fe2e0fbf8a6"
  ];

  const assignImagesToRestaurants = (data) => {
    let storedImages = JSON.parse(localStorage.getItem("assignedRestaurantImages")) || {};
    let availableImages = [...randomImages];
  
    const assigned = data.map((restaurant) => {
      if (!storedImages[restaurant.id]) {
        const image = availableImages.length > 0
          ? availableImages.splice(Math.floor(Math.random() * availableImages.length), 1)[0]
          : randomImages[Math.floor(Math.random() * randomImages.length)];
  
        storedImages[restaurant.id] = image;
      }
  
      return {
        ...restaurant,
        photo: storedImages[restaurant.id],
      };
    });
  
    localStorage.setItem("assignedRestaurantImages", JSON.stringify(storedImages));
    return assigned;
  };
  

  const fetchRestaurants = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery);
      if (sortOption) {
        params.append("sort", sortOption);
        params.append("order", sortOrder);
      }

      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const response = await fetch(`http://localhost:5000/api/restaurants?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { data, total } = await response.json();

      const restaurantsWithPhotos = assignImagesToRestaurants(data);
      setRestaurants(restaurantsWithPhotos);
      setTotalRestaurants(total);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortOption, sortOrder, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants, currentPage]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (sortOption) params.set("sort", sortOption);
    if (sortOrder) params.set("order", sortOrder);
    params.set("page", currentPage);
    params.set("limit", itemsPerPage);
    navigate(`?${params.toString()}`, { replace: true });
  }, [searchQuery, sortOption, sortOrder, currentPage, itemsPerPage, navigate]);

  const resetFilters = () => {
    setSearchQuery("");
    setSortOption("name");
    setSortOrder("asc");
    setCurrentPage(1);
    setItemsPerPage(10);
  };

  return (
    <div className="restaurant-page">
      <h2 className="restaurant-title">Restaurants</h2>

      <div className="controls">
        <input
          type="text"
          placeholder="Search restaurants..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />

        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="sort-select">
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
          <option value="total_ratings">Sort by Reviews</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="order-select">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="items-per-page-select"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
        </select>

        <button onClick={resetFilters} className="reset-button">Reset</button>
      </div>

      <div className="restaurant-list">
        {loading ? (
          <p className="loading-text">Loading restaurants...</p>
        ) : (
          restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="restaurant-card"
              onClick={() =>
                navigate(`/restaurants/${restaurant.place_id}`, {
                  state: { photo: restaurant.photo }
                })
              }              
              
              
            >
              <div className="image-wrapper">
                <img
                  src={restaurant.photo}
                  alt={restaurant.name}
                  className="restaurant-image"
                  onError={(e) => { e.target.src = fallbackImage; }}
                />
              </div>
              <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-rating">Rating: {restaurant.rating || "N/A"}</p>
                <p className="restaurant-reviews">Reviews: {restaurant.total_ratings || 0}</p>
                <p className="restaurant-address">Address: {restaurant.address}</p>
                <p className="restaurant-city">City: {restaurant.city}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Restaurants;
