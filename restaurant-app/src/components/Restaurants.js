import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./../styles/Restaurant.css";

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

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const location = useLocation();
  const navigate = useNavigate();

  const fallbackImage = "/images/no-photo.jpg"; // Pilt, kui restoranil pole pilti

  const queryParams = new URLSearchParams(location.search);
  const [searchQuery, setSearchQuery] = useState(queryParams.get("search") || "");
  const [sortOption, setSortOption] = useState(queryParams.get("sort") || "name");
  const [sortOrder, setSortOrder] = useState(queryParams.get("order") || "desc");
  const [totalRestaurants, setTotalRestaurants] = useState(0);

  // Funktsioon restoranide piltide määramiseks
  const assignImagesToRestaurants = useCallback((data) => {
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
  }, []);
  

  // Restoranide laadimise funktsioon
  const fetchRestaurants = useCallback(async () => {
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.append("search", searchQuery); // Otsingupäring
      if (sortOption) {
        params.append("sort", sortOption); // Sortimisvalik
        params.append("order", sortOrder); // Sortimisjärjekord
      }

      params.append("page", currentPage); // Praegune leht
      params.append("limit", itemsPerPage); // Leheküljel kuvatavad üksused

      const response = await fetch(`http://localhost:5000/api/restaurants?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const { data, total } = await response.json();

      const restaurantsWithPhotos = assignImagesToRestaurants(data); // Lisa restoranidele pildid
      setRestaurants(restaurantsWithPhotos);
      setTotalRestaurants(total); // Kokku restoranide arv
    } catch (error) {
      console.error("Viga restoranide laadimisel:", error);
    } finally {
      setLoading(false); // Laadimine lõppenud
    }
  }, [searchQuery, sortOption, sortOrder, currentPage, itemsPerPage, assignImagesToRestaurants]);

  // Laadi restoranid esmakordsel renderdamisel
  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // URL-i päringute värskendamine, kui kasutaja muudab filtreid
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (sortOption) params.set("sort", sortOption);
    if (sortOrder) params.set("order", sortOrder);
    params.set("page", currentPage);
    params.set("limit", itemsPerPage);
    navigate(`?${params.toString()}`, { replace: true });
  }, [searchQuery, sortOption, sortOrder, currentPage, itemsPerPage, navigate]);

  // Filtreerimise lähtestamise funktsioon
  const resetFilters = () => {
    setSearchQuery("");
    setSortOption("name");
    setSortOrder("asc");
    setCurrentPage(1);
    setItemsPerPage(10);
  };

  return (
    <div className="restaurant-page">
      <h2 className="restaurant-title">Restoranid</h2>

      <div className="controls">
        {/* Otsinguväljund */}
        <input
          type="text"
          placeholder="Otsi restorane..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Lähtesta leht
          }}
          className="search-input"
        />

        {/* Sortimisvalik */}
        <select value={sortOption} onChange={(e) => {
          setSortOption(e.target.value);
          setCurrentPage(1); // Lähtesta leht
        }} className="sort-select">
          <option value="name">Sorteeri nime järgi</option>
          <option value="rating">Sorteeri hinnangu järgi</option>
          <option value="total_ratings">Sorteeri ülevaadete järgi</option>
        </select>

        {/* Järjekorra valik */}
        <select value={sortOrder} onChange={(e) => {
          setSortOrder(e.target.value);
          setCurrentPage(1); // Lähtesta leht
        }} className="order-select">
          <option value="asc">Kasvav</option>
          <option value="desc">Kahanev</option>
        </select>

        {/* Üksuste arv lehe kohta */}
        <select
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1); // Lähtesta leht
          }}
          className="items-per-page-select"
        >
          <option value={5}>5 leheküljel</option>
          <option value={10}>10 leheküljel</option>
          <option value={20}>20 leheküljel</option>
        </select>

        {/* Lähtesta filtrid */}
        <button onClick={resetFilters} className="reset-button">Lähtesta</button>
      </div>

      <div className="restaurant-list">
        {/* Laadimisekraan */}
        {loading ? (
          <p className="loading-text">Laadime restorane...</p>
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
                  src={restaurant.photo || fallbackImage} // Kui pilt puudub, näita vaikimisi pilti
                  alt={restaurant.name}
                  className="restaurant-image"
                  onError={(e) => { e.target.src = fallbackImage; }} // Kui pilt ei lae, asenda vaikimisi pildiga
                />
              </div>
              <div className="restaurant-info">
                <h3 className="restaurant-name">{restaurant.name}</h3>
                <p className="restaurant-rating">Hinnang: {restaurant.rating || "N/A"}</p>
                <p className="restaurant-reviews">Ülevaated: {restaurant.total_ratings || 0}</p>
                <p className="restaurant-address">Aadress: {restaurant.address}</p>
                <p className="restaurant-city">Linn: {restaurant.city}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lehe pööramine */}
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
