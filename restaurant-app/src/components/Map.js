import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import "./../styles/Map.css";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 59.437, lng: 24.7536 }; // cord of Tallinn
const defaultRadius = 2000; // radius of search (1 = 1 meter)

const RestaurantMap = () => {
  const [center] = useState(defaultCenter);
  const [searchPoint, setSearchPoint] = useState(defaultCenter); // point of search, green mark on the center of circle
  const [restaurants, setRestaurants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // check if search was done
  const [isPreviewing, setIsPreviewing] = useState(false); // toggle preview mode
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const previewCircleRef = useRef(null);

  // Новый способ загрузки карты
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

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setRestaurants(results);
        setHasSearched(true);

        results.forEach(saveRestaurantToDB);
      } else {
        console.error("Error with searching restaurants:", status);
      }
    });
  }, [searchPoint, hasSearched]);

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

  const saveRestaurantToDB = async (place) => {
    try {
      const response = await fetch("http://localhost:5000/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      }
    } catch (err) {
      console.error("Error saving restaurant:", err);
    }
  };

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

  // search restaurants by click
  const mouseMapClick = (event) => {
    if (isPreviewing) {
      setSearchPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
      setHasSearched(false);
      setIsPreviewing(false); 
    }
  };

  // makes a new response when searchPoint is changed
  useEffect(() => {
    if (isLoaded && !hasSearched) {
      fetchRestaurants();
      updateRadiusCircle();
    }
  }, [isLoaded, fetchRestaurants, searchPoint, hasSearched, updateRadiusCircle]);

  if (loadError) {
    return <div className="loading-text">Ошибка загрузки карты 😥</div>;
  }

  if (!isLoaded) {
    return <div className="loading-text">Загрузка карты...</div>;
  }

  return (
    <div className="map-container">
      <div className="map-page">
        <h1 className="map-title">Поиск ресторанов на карте Таллинна</h1>
        <p className="map-description">
          Нажмите "Начать поиск", выберите точку на карте, и мы найдём для вас рестораны в радиусе 2 км!
        </p>

        <div className="button-wrapper">
          <button
            onClick={togglePreview}
            className={`button ${isPreviewing ? "cancel" : ""}`}
          >
            {isPreviewing ? "Отмена поиска" : "Начать поиск"}
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
            title="Точка поиска"
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
          />
          {restaurants.map((place, index) => (
            <Marker key={index} position={place.geometry.location} title={place.name} />
          ))}
        </GoogleMap>
      </div>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} RestaurantApp. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default RestaurantMap;