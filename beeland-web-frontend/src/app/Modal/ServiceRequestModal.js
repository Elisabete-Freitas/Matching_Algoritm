import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { AiOutlineSchedule, AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import "./ServiceRequest.css";

const ServiceRequestModal = ({
  isOpen,
  onClose,
  onConfirm,
  modalType= "confirm", 
  messageTitle,
  filters,
  setModalFilters,
  farmerCrops,
  selectedBeekeeper,
}) => {
  const [localFilters, setLocalFilters] = useState({
    cultureType: filters.cultureType || "",
    area: filters.area || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
  });

  const getCropValueString = (cropType, area) => {
  return JSON.stringify({
    cropType: String(cropType),
    area: Number(area), // força consistência
  });
};


  useEffect(() => {
  if (filters) {
    setLocalFilters({
      cultureType: filters.cultureType || "",
      area: filters.area || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    });
  }
  console.log("localFilters.cultureType:", localFilters.cultureType);
console.log("localFilters.area:", localFilters.area);
console.log("selected option value:", getCropValueString(localFilters.cultureType, localFilters.area));

}, [filters]);


  const handleFilterChange = (name, value) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));

    setModalFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };


  if (modalType === "success") {
    return (
      <div className="modal">
        <h2 >{messageTitle}</h2>
        <p>Operação bem-sucedida!</p> {/* Definindo um conteúdo para a mensagem */}
        <button onClick={onClose}>Fechar</button>
      </div>
    );
  }


  const handleSubmit = () => {
    console.log("Botão foi clicado!");
    onConfirm(localFilters);
  };

  const getIcon = () => {
    switch (modalType) {
      case "success":
        return <AiOutlineCheckCircle size={50} style={{ color: "green" }} />;
      case "error":
        return <AiOutlineCloseCircle size={50} style={{ color: "red" }} />;
      case "confirm":
      default:
        return <AiOutlineSchedule size={50} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal-icon">{getIcon()}</div>
      {/*  <h4 style={{color:"#F9CD22"}}>{messageTitle}</h4>*/}
        <div className="modal-content">
          <h5 >Tem a certeza que deseja solicitar este serviço ao Apicultor</h5>
          <p>
            <h5>
              {selectedBeekeeper?.name} {selectedBeekeeper?.lastname}?
            </h5>
          </p>
          <div className="inputs">
          <label  htmlFor="cultureType">
            Escolha a Cultura:
            <select
              id="cultureType"
              style={{marginleft: "40px"}}
             value={JSON.stringify({
  cropType: localFilters.cultureType,
  area: localFilters.area
})}

              onChange={(e) => {
                const selectedOption = JSON.parse(e.target.value);
                handleFilterChange("cultureType", selectedOption.cropType);
                handleFilterChange("area", selectedOption.area);
              }}
            >
              <option  value="" disabled>
                Selecione uma Cultura
              </option>
              {farmerCrops?.map((culture, index) => (
                <option
               
                  key={culture._id || index}
                  value={JSON.stringify({
                    cropType: culture.cropType,
                    area: culture.cropArea,
                  })}
                >
                  {culture.cropType}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="startDate">
            Data de Início:
            <input
              id="startDate"
              type="date"
              name="startDate"
              sytle={{ marginLeft:"5%"}}
              value={localFilters.startDate || ""}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
            />
          </label>
          <label htmlFor="endDate">
            Data de Fim:
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={localFilters.endDate || ""}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
            />
          </label>
        </div>
        </div>
        <div className="modal-footer">
          {modalType === "confirm" ? (
            <>
              <button className="modal-btn-ok" onClick={handleSubmit}>
                Sim
              </button>
              <button className="modal-btn-no" onClick={onClose}>
                Não
              </button>
            </>
          ) : (
            <button className="modal-btn-ok" onClick={onClose}>
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

ServiceRequestModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  modalType: PropTypes.string.isRequired,
  messageTitle: PropTypes.string.isRequired,
  filters: PropTypes.object.isRequired,
  setModalFilters: PropTypes.func.isRequired,
  farmerCrops: PropTypes.array.isRequired,
  selectedBeekeeper: PropTypes.object,
};

export default ServiceRequestModal;
