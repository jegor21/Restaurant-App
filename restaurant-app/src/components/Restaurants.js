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

  
  const queryParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = useState(queryParams.get("search") || "");
  const [sortOption, setSortOption] = useState(queryParams.get("sort") || "name");
  const [sortOrder, setSortOrder] = useState(queryParams.get("order") || "desc");
  const [totalRestaurants, setTotalRestaurants] = useState(0);

  const fallbackImage = "/images/no-photo.jpg";

  const fetchRestaurants = useCallback(async () => {
    try {
      const params = new URLSearchParams();
  
      if (searchQuery) {
        params.append("search", searchQuery);
      }
  
      if (sortOption) {
        params.append("sort", sortOption);
        params.append("order", sortOrder);
      }
  
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);
  
      const response = await fetch(`http://localhost:5000/api/restaurants?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data, total } = await response.json(); 
  
      const restaurantsWithPhotos = data.map((restaurant) => ({
        ...restaurant,
        photos: restaurant.photos && restaurant.photos !== "null" ? restaurant.photos : fallbackImage,
      }));
  
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

  // update the URL query parameters when search or sort changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (sortOption) params.set("sort", sortOption);
    if (sortOrder) params.set("order", sortOrder);
    params.set("page", currentPage);
    params.set("limit", itemsPerPage);

    navigate(`?${params.toString()}`, { replace: true });
  }, [searchQuery, sortOption, sortOrder, currentPage, itemsPerPage, navigate]);

  // reset search and sorting to default values
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
        {/* search bar */}
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

        {/* sorting options */}
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="sort-select">
          <option value="name">Sort by Name</option>
          <option value="rating">Sort by Rating</option>
          <option value="total_ratings">Sort by Reviews</option>
        </select>

        {/* sorting order */}
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="order-select">
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* items per page */}
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
      
      {/* Pagination Above */}
      <div className="pagination">
        <button
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          &laquo;
        </button>

        {Array.from({ length: Math.ceil(totalRestaurants / itemsPerPage) }, (_, index) => {
          const page = index + 1;

          if (
            page === 1 ||
            page === Math.ceil(totalRestaurants / itemsPerPage) ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                className={`pagination-button ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          }

          if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return <span key={page} className="ellipsis">...</span>;
          }

          return null;
        })}

        <button
          className="pagination-button"
          disabled={currentPage === Math.ceil(totalRestaurants / itemsPerPage)}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          &raquo;
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading restaurants...</p>
      ) : (
        <div className="restaurant-list">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="restaurant-card"
              onClick={() => navigate(`/restaurants/${restaurant.place_id}`)}
            >
              <div className="image-wrapper">
                <img
                  src={restaurant.photos || fallbackImage}
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
          ))}
        </div>
      )}

      {/* Pagination Below */}
      <div className="pagination">
        <button
          className="pagination-button"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        >
          &laquo;
        </button>

        {Array.from({ length: Math.ceil(totalRestaurants / itemsPerPage) }, (_, index) => {
          const page = index + 1;

          if (
            page === 1 ||
            page === Math.ceil(totalRestaurants / itemsPerPage) ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                className={`pagination-button ${page === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          }

          if (
            page === currentPage - 2 ||
            page === currentPage + 2
          ) {
            return <span key={page} className="ellipsis">...</span>;
          }

          return null;
        })}

        <button
          className="pagination-button"
          disabled={currentPage === Math.ceil(totalRestaurants / itemsPerPage)}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
}

export default Restaurants;