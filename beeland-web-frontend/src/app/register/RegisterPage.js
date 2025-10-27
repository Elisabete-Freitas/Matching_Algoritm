import React from "react";
import "./RegisterPage.css"; // Import the custom CSS
import Apicultor from "../assets/_beeland_apicultor.png"; // Import image asset
import Agricultor from "../assets/_beeland_agricultor.png"; // Import image asset
import Logo from "../assets/logo.png"; // Import image asset

import { useHistory } from "react-router-dom";

const RegisterPage = ({ onRegister, onUserRegister }) => {
  const history = useHistory();

  return (
    <div className="content-layout">
          <img className="register-logo" src={Logo} alt="logo" width={250} style={{cursor:"pointer"}} onClick={()=>onRegister(false)} />
        <div className="header-title">
          <span>
            {" "}
            <p style={{textAlign:"left"}}>Bolsa de Polinização Apícola</p>
          </span>
        </div>
      <span className="register-title">Registar</span>
      <span className="register-subtitle">
        Registe-se como um Apicultor ou Agricultor
      </span>
      <div className="register-wrapper">
        <div className="move-effect" onClick={() => onUserRegister("beekeeper")}>
          <div className="logo-wrapper">
            <img src={Apicultor} alt="Apicultor" width={150} />
          </div>
          <span className="button-apicultor">Apicultor</span>
        </div>
        <div className="move-effect-one" onClick={() => onUserRegister("farmer")}>
          <div className="logo-wrapper">
            <img src={Agricultor} alt="Agricultor" width={150} />
          </div>
          <span className="button-agricultor">Agricultor</span>
        </div>
        {/* <div className="card" onClick={()=> history.push("/schedule")}><div className='logo-wrapper'><MdOutlineSchedule  size={35}/></div>Agendamento</div>
        <div className="card" onClick={()=> history.push("/users")}><div className='logo-wrapper'><LuUsers size={35}/></div>Utilizadores</div> */}
      </div>
      <div className="goback-register" onClick={() => onRegister(false)}>
        {"Voltar à página principal"}
      </div>
    </div>
  );
};

export default RegisterPage;
