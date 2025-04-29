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
const defaultRadius = 2000; // radius of search (1 = 1 meter)

const RestaurantMap = () => {
  const { isAuthenticated } = useContext(UserContext); // Access auth status
  const navigate = useNavigate(); 
  const [center] = useState(defaultCenter);
  const [searchPoint, setSearchPoint] = useState(defaultCenter); // point of search, green mark on the center of circle
  const [restaurants, setRestaurants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // check if search was done
  const [isPreviewing, setIsPreviewing] = useState(false); // toggle preview mode
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const previewCircleRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
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
  
        results.forEach(saveRestaurantToDB);
      } else {
        console.error("Error with searching restaurants:", status);
      }
    });
  }, [searchPoint, hasSearched]);

  const saveRestaurantToDB = async (place) => {
    try {
      const token = localStorage.getItem("token"); 
      if (!token) {
        console.error("No authentication token found");
        return;
      }
  
      const response = await fetch("http://localhost:5000/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify({
          place_id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.vicinity || "Unknown Address",
          rating: place.rating || 0,
          total_ratings: place.user_ratings_total || 0,
          photos: [],
        }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to save restaurant:", error);
      } else {
        console.log("Restaurant saved successfully");
      }
    } catch (err) {
      console.error("Error saving restaurant:", err);
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
      setSearchPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      setHasSearched(false);
      setIsPreviewing(false);
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
        <h1 className="map-title">Search for Restaurants in Tallinn</h1>
        <p className="map-description">
          Click "Start Search", select a point on the map, and we'll find restaurants within a 2 km radius for you!
        </p>

        <div className="button-wrapper">
          <button
            onClick={togglePreview}
            className={`button ${isPreviewing ? "cancel" : ""}`}
          >
            {isPreviewing ? "Cancel Search" : "Start Search"}
          </button>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={14}
          onLoad={(map) => (mapRef.current = map)}
          onClick={mouseMapClick}
          onMouseMove={updatePreviewRadius}
        >
          <Marker
            position={searchPoint}
            title="Search Point"
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
          />
          {restaurants.map((place, index) => (
            <Marker key={index} position={place.geometry.location} title={place.name} />
          ))}
        </GoogleMap>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} RestaurantApp. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default RestaurantMap;