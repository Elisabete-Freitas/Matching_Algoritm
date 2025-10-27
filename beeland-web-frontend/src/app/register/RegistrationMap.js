import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "./RegistrationMap.css";
import "leaflet/dist/leaflet.css";
import markerIcon from '../assets/_beeland_agricultor.png';

const MAP_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const GEOCODE_URL =
  "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?f=pjson&langCode=EN&location=";

const regionMap = {
  'Viana do Castelo': 'Norte',
  'Braga': 'Norte',
  'Vila Real': 'Norte',
  'Bragança': 'Norte',
  'Porto': 'Norte',
  'Aveiro': 'Centro',
  'Guarda': 'Centro',
  'Viseu': 'Centro',
  'Coimbra': 'Centro',
  'Castelo Branco': 'Centro',
  'Leiria': 'Centro',
  'Lisboa': 'Sul',
  'Santarém': 'Sul',
  'Setúbal': 'Sul',
  'Beja': 'Sul',
  'Évora': 'Sul',
  'Portalegre': 'Sul',
  'Faro': 'Sul'
};

const RegistrationMap = ({ onUserInfoChange, range }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [fullAddress, setFullAddress] = useState({});
  const [isToFly, setIsToFly] = useState(true);
  const [latLong, setLatLong] = useState({});

  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `<img src="${markerIcon}" alt="marker" style="width: 30px; height: 30px;" />`, // Adjust size as needed
    iconSize: [40, 40], // Adjust size as needed
    iconAnchor: [20, 40], // Adjust anchor point as needed
    popupAnchor: [0, -10], // Adjust popup anchor as needed
  });

  const setMarker = (mapClickInfo) => {
    setMarkerPosition(mapClickInfo.latlng);
    reverseGeoCoding(mapClickInfo.latlng);
  };

  const getRegionFromDistrict = (district) => regionMap[district] || 'Unknown';

  const reverseGeoCoding = async (coordinates) => {
    const response = await fetch(`${GEOCODE_URL}${coordinates.lng},${coordinates.lat}`);
    const data = await response.json();

    const addressLabel = data.address ? data.address.LongLabel : "Unknown";
    const district = data.address && data.address.Region ? data.address.Region : "Unknown";
    const region = regionMap[district] || "Unknown";

    const address = {
      ...data.address,
      region: region,
    };

    setFullAddress(address);
    setLatLong(coordinates);
    onUserInfoChange({
      street: address.Address,
      postalCode: address.Postal,
      region: region,
      distrito: address.Region,
      city: address.City,
      country: address.CntryName,
      lat: coordinates.lat,
      long: coordinates.lng,
    });
  };

  const getMarker = () => {
    if (markerPosition) {
      return (
        <>
          <Marker position={markerPosition} icon={customIcon}>
            <Popup offset={[0, 0]} className="font-weight-bold">
              {getStringMarkerPosition()}
              <button className="default-button" onClick={handlePassInfoToParent}>
                Definir Morada
              </button>
            </Popup>
          </Marker>
          <Circle
            center={markerPosition}
            radius={range} //RAIO DE 50KM
            color="green"
            fillColor="green"
            fillOpacity={0.2}
          />
        </>
      );
    }
  };

  const getStringMarkerPosition = () => {
    const region = getRegionFromDistrict(fullAddress.Region);
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span><b>Rua:</b> {fullAddress.Address}</span>
        <span><b>Cod. Postal: </b>{fullAddress.Postal}</span>
        <span><b>Localidade:</b> {fullAddress.City}</span>
        <span><b>Distrito:</b> {fullAddress.Region}</span>
      </div>
    );
  };

  const LocationMarker = ({ initialLocate }) => {
    const map = useMapEvents({
      click: (e) => {
        const latlng = e.latlng;
        reverseGeoCoding(latlng);
        setMarkerPosition(latlng);
        getMarker();
        setIsToFly(false);
        map.flyTo(latlng, 13);
      },
      locationfound: (e) => {
        if (initialLocate) {
          const latlng = e.latlng;
          if (!markerPosition || (Math.abs(markerPosition.lat - latlng.lat) > 0.001 || Math.abs(markerPosition.lng - latlng.lng) > 0.001)) {
            reverseGeoCoding(latlng);
            setMarkerPosition(latlng);
            getMarker();
            map.setView(latlng, 7);
            setIsToFly(false);
          }
        }
      },
    });

    useEffect(() => {
      if (initialLocate) {
        map.locate();
      }
    }, [initialLocate, map]);

    return null;
  };

  const handlePassInfoToParent = () => {
    const region = getRegionFromDistrict(fullAddress.Region);
    onUserInfoChange({
      street: fullAddress.Address,
      postalCode: fullAddress.Postal,
      region: region,
      distrito: fullAddress.Region,
      city: fullAddress.City,
      country: fullAddress.CntryName,
      lat: latLong.lat,
      long: latLong.lng,
    });
  };

  useEffect(() => {
    if (fullAddress && latLong) {
      handlePassInfoToParent();
    }
  }, [fullAddress, latLong]);

  return (
    <MapContainer id="map1" className="map1 map-wrapper" center={[39.6, -8]} zoom={7}>
      <TileLayer
        url={MAP_LAYER_URL}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker initialLocate={isToFly} />
      {getMarker()}
    </MapContainer>
  );
};

export default RegistrationMap;
