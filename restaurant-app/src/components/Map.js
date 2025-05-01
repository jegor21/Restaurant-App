import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext"; 
import "./../styles/Map.css";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 59.437, lng: 24.7536 }; // cord of Tallinn
const defaultRadius = 500; // radius of search (1 = 1 meter)

const libraries = ["places"];

const RestaurantMap = () => {
  const { isAuthenticated } = useContext(UserContext); // Access auth status
  const navigate = useNavigate(); 
  const [center] = useState(defaultCenter);
  const [searchPoint, setSearchPoint] = useState(defaultCenter); // point of search, green mark on the center of circle
  const [restaurants, setRestaurants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // check if search was done
  const [isPreviewing, setIsPreviewing] = useState(false); // toggle preview mode
  const [city, setCity] = useState("Tallinn"); // City of the search
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const previewCircleRef = useRef(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const resultRefs = useRef({});

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const fetchRestaurants = useCallback(() => {
    if (!mapRef.current || hasSearched) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: searchPoint,
      radius: defaultRadius,
      type: "restaurant",
    };

    console.log("Sending nearbySearch request with:", request);

    service.nearbySearch(request, (results, status) => {
      console.log("nearbySearch status:", status);
      console.log("nearbySearch results:", results);

      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setRestaurants(results);
        setHasSearched(true);

        saveRestaurantToDB(searchPoint, results);
      } else {
        console.error("Error with searching restaurants:", status);
      }
    });
  }, [searchPoint, hasSearched]);

  const fetchCityName = async (lat, lng) => {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
  
      if (response.results.length > 0) {
        const addressComponents = response.results[0].address_components;
        const cityComponent = addressComponents.find((component) =>
          component.types.includes("locality")
        );
  
        if (cityComponent) {
          setCity(cityComponent.long_name);
        } else {
          console.warn("City not found in address components");
        }
      } else {
        console.warn("No results from geocoding");
      }
    } catch (error) {
      console.error("Error fetching city name:", error);
    }
  };

  const saveRestaurantToDB = async (searchPoint, places) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      if (!Array.isArray(places)) {
        console.error("Error: places is not an array:", places);
        return;
      }

      const restaurants = places.map((place) => ({
        place_id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.vicinity || "Unknown Address",
        rating: place.rating || 0,
        total_ratings: place.user_ratings_total || 0,
        photos: "no-photo.jpg",
      }));

      console.log("Sending data to backend:", { searchPoint, restaurants });

      const response = await fetch("http://localhost:5000/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ searchPoint, restaurants }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to save restaurants:", error);
      } else {
        console.log("Restaurants saved successfully");
      }
    } catch (err) {
      console.error("Error saving restaurants:", err);
    }
  };

  const updateRadiusCircle = useCallback(() => {
    if (!mapRef.current) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    const circle = new window.google.maps.Circle({
      center: searchPoint,
      radius: defaultRadius,
      fillColor: "#4caf50",
      fillOpacity: 0.2,
      strokeColor: "#4caf50",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      clickable: false,
    });
    circle.setMap(mapRef.current);
    circleRef.current = circle;
  }, [searchPoint]);

  const updatePreviewRadius = (e) => {
    if (!mapRef.current || !isPreviewing) return;

    const latLng = e.latLng;

    if (previewCircleRef.current) {
      previewCircleRef.current.setMap(null);
    }

    const previewCircle = new window.google.maps.Circle({
      center: latLng,
      radius: defaultRadius,
      fillColor: "#2196f3",
      fillOpacity: 0.1,
      strokeColor: "#2196f3",
      strokeOpacity: 0.5,
      strokeWeight: 2,
      clickable: false,
    });
    previewCircle.setMap(mapRef.current);
    previewCircleRef.current = previewCircle;
  };

  const togglePreview = () => {
    if (isPreviewing) {
      // clear preview circle if toggling off
      if (previewCircleRef.current) {
        previewCircleRef.current.setMap(null);
        previewCircleRef.current = null;
      }
    }
    setIsPreviewing(!isPreviewing);
  };

  const mouseMapClick = (event) => {
    if (isPreviewing) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
  
      setSearchPoint({ lat, lng });
      setHasSearched(false);
      setIsPreviewing(false);
  
      fetchCityName(lat, lng);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { errorMessage: "You need to log in to access the map." } });
      return;
    }

    if (isLoaded && !hasSearched) {
      fetchRestaurants();
      updateRadiusCircle();
    }
  }, [isAuthenticated, isLoaded, fetchRestaurants, searchPoint, hasSearched, updateRadiusCircle, navigate]);

  if (loadError) {
    return <div className="loading-text">Error loading map 😥</div>;
  }

  if (!isLoaded) {
    return <div className="loading-text">Loading map...</div>;
  }

  return (
    <div className="map-container">
      <div className="map-page">
        <h1 className="map-title">Search for Restaurants</h1>
        <p className="map-description">
          Click "Start Search", select a point on the map, and we'll find restaurants within a 500m radius for you!
        </p>

        <div className="button-wrapper">
          <button
            onClick={togglePreview}
            className={`button ${isPreviewing ? "cancel" : ""}`}
          >
            {isPreviewing ? "Cancel Search" : "Start Search"}
          </button>
        </div>

        <div className="map-results-container">
          {/* Map Section */}
          <div className="map-section">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={(map) => (mapRef.current = map)}
                onClick={mouseMapClick}
                onMouseMove={updatePreviewRadius}
              >
                {/* Search Point Marker */}
                <Marker
                  position={searchPoint}
                  title="Search Point"
                  icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
                />

                {/* Restaurant Markers */}
                {restaurants.map((place, index) => (
                <Marker
                  key={place.place_id}
                  position={place.geometry.location}
                  title={place.name}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    scaledSize: new window.google.maps.Size(
                      hoveredPlaceId === place.place_id ? 50 : 32,
                      hoveredPlaceId === place.place_id ? 50 : 32
                    ),
                  }}
                  onClick={() => navigate(`/restaurants/${place.id || place.place_id}`)}
                  onMouseOver={() => {
                    setHoveredPlaceId(place.place_id);
                    resultRefs.current[place.place_id]?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onMouseOut={() => setHoveredPlaceId(null)}
                />
              ))}
              </GoogleMap>
            </div>

            {/* Results Section */}
            <div className="results-section">
              <h2>Search Results</h2>
              <p className="results-city">City: <strong>{city}</strong></p>
              {restaurants.length === 0 ? (
                <p>No restaurants found. Try another location.</p>
              ) : (
                <ul>
                  {restaurants.map((place, index) => (
                    <li
                      key={place.place_id}
                      ref={(el) => (resultRefs.current[place.place_id] = el)}
                      onClick={() => navigate(`/restaurants/${place.place_id}`)}
                      onMouseEnter={() => setHoveredPlaceId(place.place_id)}
                      onMouseLeave={() => setHoveredPlaceId(null)}
                      className={`result-item ${hoveredPlaceId === place.place_id ? "hovered" : ""}`}
                    >
                      <strong>{place.name}</strong>
                      <p>Address: {place.vicinity || "Unknown Address"}</p>
                      <p>Rating: {place.rating || "N/A"} ({place.user_ratings_total || 0} reviews)</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} RestaurantApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RestaurantMap;