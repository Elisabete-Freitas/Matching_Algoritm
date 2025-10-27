import React from "react";
import { TbLogout } from "react-icons/tb";
import "./ModalExit.css";

const ModalExit = ({ onClose, onConfirm }) => {
  return (
    <div className="exit-modal-overlay">
      <div className="exit-modal-content">
        <div className="exit-modal-cancel-btn"><button style={{background:"none", border:"none", color:"white", cursor:"pointer"}} onClick={onClose}>X</button></div>
        <div className="exit-modal-logo"><TbLogout size={50}/></div>
        <p style={{fontSize:"1.5rem"}}>Tem a certeza?</p>
        <div className="exit-modal-buttons-wrapper">
          <button className="exit-btn-ok" onClick={onConfirm}>Sim</button>
          <button className="exit-btn-no" onClick={onClose}>Não</button>
        </div>
      </div>
    </div>
  );
};

export default ModalExit;
