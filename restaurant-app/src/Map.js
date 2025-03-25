import React, { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";



const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 59.437, lng: 24.7536 }; // cord of Tallinn

const RestaurantMap = () => {
  const [center] = useState(defaultCenter);
  const [searchPoint, setSearchPoint] = useState(defaultCenter); // point of search, green mark on the center of circle
  const [radius, setRadius] = useState(2000); // radius of search (by default 2000 = 2000 m)
  const [restaurants, setRestaurants] = useState([]);
  const [hasSearched, setHasSearched] = useState(false); // check if search was done
  const mapRef = useRef(null);
  const circleRef = useRef(null);
  const previewCircleRef = useRef(null); // preview circle

  // searchNeabyPlaces
  const fetchRestaurants = useCallback(() => {
    if (!mapRef.current || hasSearched) return; 

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: searchPoint, 
      radius: radius,
      type: "restaurant",
    };

    service.nearbySearch(request, (results, status) => {
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setRestaurants(results);
        setHasSearched(true); 
      } else {
        console.error("Error with searching restaurants:", status);
      }
    });
  }, [searchPoint, radius, hasSearched]);

  // refresh circle of search
  const updateRadiusCircle = useCallback(() => {
    if (!mapRef.current) return;

    if (circleRef.current) { 
      circleRef.current.setMap(null); 
    }

    const circle = new window.google.maps.Circle({
      center: searchPoint,
      radius: radius,
      fillColor: "#FF0000",
      fillOpacity: 0.2,
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      clickable: false, 
    });
    circle.setMap(mapRef.current); 
    circleRef.current = circle; 
  }, [searchPoint, radius]);

  // preview circle
  const updatePreviewRadius = (e) => {
    if (!mapRef.current) return;

    
    const latLng = e.latLng;

    if (previewCircleRef.current) {
      previewCircleRef.current.setMap(null); 
    }

    
    const previewCircle = new window.google.maps.Circle({
      center: latLng,
      radius: radius,
      fillColor: "#0000FF", 
      fillOpacity: 0.1,
      strokeColor: "#0000FF",
      strokeOpacity: 0.5,
      strokeWeight: 2,
      clickable: false,
    });
    previewCircle.setMap(mapRef.current); 
    previewCircleRef.current = previewCircle; 
  };

  // search restaurants by click
  const mouseMapClick = (event) => {
    setSearchPoint({ lat: event.latLng.lat(), lng: event.latLng.lng() });
    setHasSearched(false); 
  };

  // makes a new respone when searchPoint is changed
  useEffect(() => {
    if (!hasSearched) {
      fetchRestaurants(); 
    }
    updateRadiusCircle();
  }, [fetchRestaurants, searchPoint, radius, hasSearched, updateRadiusCircle]);

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <div>
        <label>Radius of search (m):</label>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ margin: "10px", padding: "5px" }}
        />
        <button onClick={fetchRestaurants}>search</button>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center} 
        zoom={14}
        onLoad={(map) => (mapRef.current = map)}
        onClick={mouseMapClick}
        onMouseMove={updatePreviewRadius} 
      >
        {}
        <Marker
          position={searchPoint}
          title="Point of search"
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          }}
        />

        {}
        {restaurants.map((place, index) => (
          <Marker key={index} position={place.geometry.location} title={place.name} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default RestaurantMap;
