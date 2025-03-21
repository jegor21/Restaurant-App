import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "700px",
};

const center = { // cord Tallinn
  lat: 59.437, 
  lng: 24.7536,
};

const Map = () => {
  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        {}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;