import React, { useEffect, useState } from 'react';

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch restaurants from the backend
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/restaurants");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRestaurants(data);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#e0f7fa' }}>
      <h2>Restaurants in Tallinn</h2>
      {loading ? (
        <p>Loading restaurants...</p>
      ) : restaurants.length === 0 ? (
        <p>No restaurants found in the database.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              style={{
                marginBottom: '2rem',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
                backgroundColor: '#004d40',
                color: '#ffffff',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '1rem auto',
              }}
            >
              <h3>{restaurant.name}</h3>
              <p><strong>Address:</strong> {restaurant.address || "Unknown Address"}</p>
              <p><strong>Rating:</strong> {restaurant.rating || "N/A"} ({restaurant.total_ratings || 0} reviews)</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Restaurants;