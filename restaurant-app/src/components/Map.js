import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext"; 
import "./../styles/Map.css";
import { useTranslation } from 'react-i18next';

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 59.437, lng: 24.7536 }; 
const defaultRadius = 500; 

const libraries = ["places"];

const RestaurantMap = () => {
  const { isAuthenticated } = useContext(UserContext); 
  const navigate = useNavigate(); 
  const [center] = useState(defaultCenter);
  const [searchPoint, setSearchPoint] = useState(defaultCenter); 
  const [restaurants, setRestaurants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); 
  const [isPreviewing, setIsPreviewing] = useState(false); 
  const [city, setCity] = useState("Tallinn"); 
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const previewCircleRef = useRef(null);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const resultRefs = useRef({});
  const { t } = useTranslation();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // Restoranide otsimise funktsioon
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
        saveRestaurantToDB(searchPoint, results);
      } else {
        console.error("Restoranide otsingu viga:", status);
      }
    });
  }, [searchPoint, hasSearched]);

  // Linnanime otsimine geograafiliste koordinaatide põhjal
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
          console.warn("Linna nimi ei leitud.");
        }
      } else {
        console.warn("Geokodeerimine ei andnud tulemusi.");
      }
    } catch (error) {
      console.error("Linna nime otsingu viga:", error);
    }
  };

  // Funktsioon restoranide salvestamiseks andmebaasi
  const saveRestaurantToDB = async (searchPoint, places) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Autentimise token puudu");
        return;
      }

      if (!Array.isArray(places)) {
        console.error("Viga: places ei ole massiiv:", places);
        return;
      }

      const restaurants = places.map((place) => ({
        place_id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        address: place.vicinity || "Tundmatu aadress",
        rating: place.rating || 0,
        total_ratings: place.user_ratings_total || 0,
        photos: "no-photo.jpg",
      }));

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
        console.error("Restoranide salvestamise viga:", error);
      } else {
        console.log("Restoranid salvestatud edukalt");
      }
    } catch (err) {
      console.error("Restoranide salvestamise viga:", err);
    }
  };

  // Funktsioon, et muuta ringi (radius) kuju kaardil
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

  // Funktsioon, et muuta eelvaate ringi kuju kaardil
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

  // Eelvaate funktsiooni lülitamine sisse ja välja
  const togglePreview = () => {
    if (isPreviewing) {
      if (previewCircleRef.current) {
        previewCircleRef.current.setMap(null);
        previewCircleRef.current = null;
      }
    }
    setIsPreviewing(!isPreviewing);
  };

  // Kaardi klõpsu käsitlemine, et valida uus otsingupunkt
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

  // Kasutaja autentimine ja kaardi laadimine
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { errorMessage: "Peate sisselogimiseks sisse logima." } });
      return;
    }

    if (isLoaded && !hasSearched) {
      fetchRestaurants();
      updateRadiusCircle();
    }
  }, [isAuthenticated, isLoaded, fetchRestaurants, searchPoint, hasSearched, updateRadiusCircle, navigate]);

  if (loadError) {
    return <div className="loading-text">Kaardi laadimise viga 😥</div>;
  }

  if (!isLoaded) {
    return <div className="loading-text">Kaart laadib...</div>;
  }

  return (
    <div className="map-container">
      <div className="map-page">
        <h1 className="map-title">Otsi restorane</h1>
        <p className="map-description">
          Klõpsake "Alusta otsingut", valige kaardilt punkt ja me leiame restoranid 500m raadiuses!
        </p>

        <div className="button-wrapper">
          <button
            onClick={togglePreview}
            className={`button ${isPreviewing ? "cancel" : ""}`}
          >
            {isPreviewing ? "Tühista otsing" : "Alusta otsingut"}
          </button>
        </div>

        <div className="map-results-container">
          <div className="map-section">
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
                title="Otsingupunkt"
                icon={{ url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png" }}
              />

              {restaurants.map((place) => (
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
                  onClick={() => window.open(`/restaurants/${place.place_id}`, "_blank")}
                  onMouseOver={() => {
                    setHoveredPlaceId(place.place_id);
                    resultRefs.current[place.place_id]?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                  onMouseOut={() => setHoveredPlaceId(null)}
                />
              ))}
            </GoogleMap>
          </div>

          <div className="results-section">
            <h2>Otsingu tulemused</h2>
            <p className="results-city">Linn: <strong>{city}</strong></p>
            {restaurants.length === 0 ? (
              <p>Restorane ei leitud. Proovige teist asukohta.</p>
            ) : (
              <ul>
                {restaurants.map((place) => (
                  <li
                    key={place.place_id}
                    ref={(el) => (resultRefs.current[place.place_id] = el)}
                    onClick={() => window.open(`/restaurants/${place.place_id}`, "_blank")}
                    onMouseEnter={() => setHoveredPlaceId(place.place_id)}
                    onMouseLeave={() => setHoveredPlaceId(null)}
                    className={`result-item ${hoveredPlaceId === place.place_id ? "hovered" : ""}`}
                  >
                    <strong>{place.name}</strong>
                    <p>Aadress: {place.vicinity || "Tundmatu aadress"}</p>
                    <p>Hinnang: {place.rating || "N/A"} ({place.user_ratings_total || 0} arvustust)</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantMap;
