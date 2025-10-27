import React from "react";
import farmerIcon from "../assets/_beeland_agricultor.png";
import beekeeperIcon from "../assets/_beeland_apicultor.png";
import "./LegendMap.css"

const LegendMap = ({role}) => {

  const legendIcons = role === "Farmer" ? 
    <div className="legend-wrapper">
        <span className="legend-item"><img className="custom-marker farmer" src={farmerIcon} alt="" />A minha localização</span>
        <span className="legend-item"><img className="custom-marker beekeeper" src={beekeeperIcon} alt="" />Apicultores</span>
    </div>    
    :
    <div className="legend-wrapper">
       <span className="legend-item"><img className="custom-marker beekeeper" src={beekeeperIcon} alt="" />A minha localização</span>
       <span className="legend-item"><img className="custom-marker farmer" src={farmerIcon} alt="" />Agricultores</span>
    </div>;

  return (
    <div className="map-legend">
      {legendIcons}
    </div>
  );
};
export default LegendMap;
