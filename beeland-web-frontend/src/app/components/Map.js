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
import "./Map.css";
import "leaflet/dist/leaflet.css";
import farmerIcon from '../assets/_beeland_agricultor.png';
import beekeeperIcon from '../assets/_beeland_apicultor.png';

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

const Map = ({ onProducerInfoChange, distanceRadius, data, userLatLong }) => {
  const [markerPosition, setMarkerPosition] = useState(null);
  const [fullAddress, setFullAddress] = useState({});
  const [isToFly, setIsToFly] = useState(true);
  const [latLong, setLatLong] = useState({});


  //console.log(userLatLong);
  const role = JSON.parse(localStorage.getItem('user')).role;
 
  const customIcon = L.divIcon({
    className: 'custom-marker' + (role === "beekeeper"? " beekeeper" : " farmer"),
    html: `<img src="${role === "beekeeper" ? beekeeperIcon : farmerIcon}" alt="marker" style="width: 30px; height: 30px;" />`, // Adjust size as needed
    iconSize: [40, 40], 
    iconAnchor: [20, 40], 
    popupAnchor: [0, -10], 
  });

  const customIconOthers = L.divIcon({
    className: 'custom-marker' + (role === "farmer"? " beekeeper" : " farmer"),
    html: `<img src="${role === "farmer" ? beekeeperIcon : farmerIcon}" alt="marker" style="width: 30px; height: 30px;" />`, // Adjust size as needed
    iconSize: [40, 40], 
    iconAnchor: [20, 40], 
    popupAnchor: [0, -10], 
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

    setFullAddress({
      ...data.address,
      region: region,
    });
    setLatLong(coordinates);
  };

  const getMarker = () => {
    //console.log("mapa",userLatLong);
    if (userLatLong && userLatLong.lat && userLatLong.long) {
      return (
        <>
          <Marker
            position={[userLatLong.lat, userLatLong.long]}
            icon={customIcon}
          >
            {role === "beekeeper" ? (
              <Popup>
                <div className="marker-popup">
                  <img src={beekeeperIcon} alt="Hive Icon" />
                  <h5>Apicultor</h5>
                  Colmeias: <b>{userLatLong.hiveCount}</b>
                  <br />
                  Área de serviço: <b>{userLatLong.serviceArea / 1000}Km</b>
                  <br />
                </div>
              </Popup>
            ) : (
              <Popup>
  <div className="marker-popup">
    <img src={farmerIcon} alt="Hive Icon" />
    <h5>Agricultor</h5>
    {userLatLong?.farmer?.crops.map((crop, index) => (
      <div key={crop._id || index}>
        <p>
          Cultura: <b>{crop?.cropType}</b>
          <br />
          Área da cultura: <b>{crop.cropArea} Ha</b>
        </p>
      </div>
    ))}
  </div>
</Popup>

            )}
          </Marker>
          <Circle
            center={[userLatLong.lat, userLatLong.long]}
            radius={userLatLong.serviceArea ? userLatLong.serviceArea : 0}
            color="green"
            fillColor="green"
            fillOpacity={0.2}
          />
        </>
      );
    } else if (markerPosition) {
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
            radius={distanceRadius ? distanceRadius : 0}
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
        <br />
        <span><b>Região:</b> {region}</span>
        <span><b>País:</b> {fullAddress.CntryName}</span>
        <br />
        {/* <span><b>Coord. GPS:</b></span>{markerPosition.lat.toFixed(8) + ", " + markerPosition.lng.toFixed(8)} */}
      </div>
    );
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      locationfound: (e) => {
        if (!role) {
          const latlng = e.latlng;
          setMarkerPosition(latlng);
          map.flyTo(latlng, 13);
        }
        else {
          setMarkerPosition({
            lat: userLatLong.lat,
            lng: userLatLong.long,
          });
        }
      },
      click: (e) => {
        if (!role) {
          const latlng = e.latlng;
          setMarkerPosition(latlng);
          reverseGeoCoding(latlng);
          map.flyTo(latlng, 13);
        }
      },
    });
  
    useEffect(() => {
      //console.log("map and userLatLong", map, userLatLong);
      if (!userLatLong && !role) {
        map.locate({setView: true, maxZoom: 16});
      }
      if (userLatLong && userLatLong.lat && userLatLong.long) {
        map.flyTo([userLatLong.lat, userLatLong.long], 9);
      }
    }, [map, userLatLong, role]);
    
  
    return null;
  };
  

  const handlePassInfoToParent = () => {
    const region = getRegionFromDistrict(fullAddress.Region);
    onProducerInfoChange({
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

  const BeekeeperPopup = ({ data }) => (
    <Popup>
      <div className="marker-popup">
        <img src={beekeeperIcon} alt="Hive Icon" />
        <h5>Apicultor</h5>
        <b>
          {data.name} {data.lastname}
        </b>       

        <div className="data-section">
          <span>Total Colmeias:</span>{" "}
          <strong>{data.beekeeper.hiveCount}</strong>
        </div>
        <div className="data-section-active">
          <div className="data-section">
            <span>Disponíveis: </span>
            <strong style={{ color: "var(--success-color)" }}>
              {data.beekeeper.hiveCount - data.beekeeper.hivesReserved}
            </strong>
          </div>
          <div className="data-section">
            <span>Em polinização:</span>{" "}
            <strong style={{ color: "var(--select-color)" }}>
              {data.beekeeper.hivesReserved}
            </strong>
          </div>
        </div>
      </div>
    </Popup>
  );

  const FarmerPopup = ({ data }) => (
    <Popup>
      <div className="marker-popup">
        <img src={farmerIcon} alt="Farmer Icon" />
        <h5>Agricultor</h5>
        <b>
          {data.name} {data.lastname}
        </b>       

        <div className="data-section">
          <span>Culturas:</span>{" "}
          <span>{data?.farmer?.cropType}</span>
        </div>
       <div className="data-section">
        <span>Área da cultura:</span>{" "}
        <span>{data?.farmer?.farmArea} Ha</span>
        </div>
      </div>
    </Popup>
  );

  return (
    <MapContainer id="map1" className="map1 map-wrapper" center={[39.6, -8]} zoom={7}>
      <TileLayer
        url={MAP_LAYER_URL}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
      {getMarker()}
      {data && data?.map((item, index) => (
        <Marker
          key={index}
          position={[item.lat, item.long]}
          icon={customIconOthers}
        >
          {item.role === "beekeeper" ? <BeekeeperPopup data = {item}/> : <FarmerPopup data = {item}/>}
        </Marker>
      ))}
      {<LocationMarker initialLocate={isToFly} />}
    </MapContainer>
  );
};

export default Map;
