import React from "react";
import {AiOutlineCheckCircle} from "react-icons/ai"
import "./SucessModal.css";


const SuccessModal = ({ isOpen, onClose, message, title , onRegister}) => {
 
  return (
    isOpen && (
      <div className="generic-success-modal-overlay" style={{zIndex:100}}>
        <div className="col-3 generic-success-modal-content">
          <div className="modal-title">{title}</div>
        <button className="generic-success-modal-close" onClick={onClose}>X</button>
        <AiOutlineCheckCircle size={65} color="var(--primary-color)" />
          <div className="generic-success-message">{message}</div>
          <button className="col-12 default-button"  onClick={onClose}>
            Ok
          </button>
        </div>
      </div>
    )
  );
};

export default SuccessModal;
