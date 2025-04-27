import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import "./Map.css";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 59.437, lng: 24.7536 };
const defaultRadius = 2000;

const RestaurantMap = () => {
  const [center] = useState(defaultCenter);
  const [searchPoint, setSearchPoint] = useState(defaultCenter);
  const [restaurants, setRestaurants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const previewCircleRef = useRef(null);

  const fetchPlaceDetails = async (placeId) => {
    try {
      const service = new window.google.maps.places.PlacesService(mapRef.current);
      return new Promise((resolve, reject) => {
        service.getDetails(
          {
            placeId: placeId,
            fields: ["place_id", "name", "geometry.location", "vicinity", "photos", "rating", "user_ratings_total"],
          },
          (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
              resolve(place);
            } else {
              console.error("Ошибка при получении деталей ресторана:", status);
              reject(status);
            }
          }
        );
      });
    } catch (error) {
      console.error("Ошибка в fetchPlaceDetails:", error);
      return null;
    }
  };

  const fetchRestaurants = useCallback(() => {
    if (!mapRef.current || hasSearched) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: searchPoint,
      radius: defaultRadius,
      type: "restaurant",
    };

    service.nearbySearch(request, async (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setHasSearched(true);

        for (const result of results) {
          try {
            const detailedPlace = await fetchPlaceDetails(result.place_id);
            if (detailedPlace) {
              await saveRestaurantToDB(detailedPlace);
            }
          } catch (error) {
            console.error("Ошибка при загрузке деталей ресторана:", error);
          }
        }
      } else {
        console.error("Ошибка при поиске ресторанов:", status);
      }
    });
  }, [searchPoint, hasSearched]);

  const saveRestaurantToDB = async (place) => {
  try {
    const response = await fetch("http://localhost:5000/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        place_id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.vicinity || "Unknown Address",
        rating: place.rating || 0,
        total_ratings: place.user_ratings_total || 0,
        photos: (place.photos && place.photos.length > 0)
          ? place.photos.filter(photo => photo && photo.photo_reference).map(photo => photo.photo_reference)
          : [],
      }),
    });

    const data = await response.json();
    if (!response.ok) console.error("Не удалось сохранить ресторан:", data);
  } catch (err) {
    console.error("Ошибка при сохранении ресторана:", err);
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
    if (isPreviewing && previewCircleRef.current) {
      previewCircleRef.current.setMap(null);
      previewCircleRef.current = null;
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
    if (!hasSearched) {
      fetchRestaurants();
    }
    updateRadiusCircle();
  }, [fetchRestaurants, searchPoint, hasSearched, updateRadiusCircle]);

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

        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          libraries={["places"]}
        >
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
        </LoadScript>
      </div>

      {/* Футер */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} RestaurantApp. Все права защищены.</p>
      </footer>
    </div>
  );
};

export default RestaurantMap;
