import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import "./App.scss";
import "./global.css"
import Navbar from "./shared/Navbar";
import Footer from "./shared/Footer";
import AppRoutes from "./AppRoutes";
import Login from "./Login";
import RegisterPage from "./register/RegisterPage";
import BeekeeperRegistration from "./register/RegisterBeekeeper";
import FarmerRegistration from "./register/RegisterFarmer";
import { AuthContext } from "./auth/AuthContext";

import "react-datepicker/dist/react-datepicker.css";


const App = () => {
  const [registerClicked, setRegisterClicked] = useState(false);
  const [registerType, setRegisterType] = useState('');
  const history = useHistory();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated);
  

  useEffect(() => {
    
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    history.push("/login");
  };

  const handleRegister = () => {
    setRegisterClicked(true);
  };

  if (!isLoggedIn && registerClicked) {
    switch (registerType) {
      case "beekeeper":
        return (
          <BeekeeperRegistration
            onUserRegister={setRegisterType}
            onRegister={() => setRegisterClicked(false)} // Passamos aqui o onRegister
          />
        );
      case "farmer":
        return (
          <FarmerRegistration
            onUserRegister={setRegisterType}
            onRegister={() => setRegisterClicked(false)} // O mesmo para o FarmerRegistration
          />
        );
      default:
        return (
          <RegisterPage
            onRegister={() => setRegisterClicked(false)}
            onUserRegister={setRegisterType}
          />
        );
    }
  }
  

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }
  

  if(isAuthenticated)return (
    <div style={{ background: "#F5F5EB", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ background: "#F5F5EB" }}>
        <div className="main-container" style={{ background: "#F5F5EB" }}>
          <AppRoutes />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
