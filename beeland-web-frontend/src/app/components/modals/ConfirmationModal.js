import React from 'react';
import { AiOutlineSchedule, AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import "./ConfirmationModal.css";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, messageContent, messageTitle, status }) => {
    const getIcon = () => {
        switch (status) {
            case "success": return <AiOutlineCheckCircle size={50} style={{ color: "green" }} />;
            case "error": return <AiOutlineCloseCircle size={50} style={{ color: "red" }} />;
            case "confirm":
            default: return <AiOutlineSchedule size={50} />;
        }
    };

    const getButtons = () => {
        if (status === "confirm") {
            return (
                <>
                    <button className="confirmation-btn-ok" onClick={onConfirm}>Sim</button>
                    <button className="confirmation-btn-no" onClick={onClose}>Não</button>
                </>
            );
        }
        return <button className="confirmation-btn-ok" onClick={onClose}>OK</button>;
    };

    if (!isOpen) return null;

    return (
        <div className="confirmation-modal-overlay">
            <div className="confirmation-modal-content">
                <div className="confirmation-modal-cancel-btn">
                    <button style={{ background: "none", border: "none", color: "white", cursor: "pointer" }} onClick={onClose}>X</button>
                </div>
                <div className="confirmation-modal-logo">{getIcon()}</div>
                <h4>{messageTitle}</h4>
                {messageContent}
                <div className="confirmation-modal-buttons-wrapper">
                    {getButtons()}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
