import React from 'react';
import './HomePage.css'; // Import the custom CSS
import Apicultor from "../assets/_beeland_apicultor.png"; // Import image asset
import Agricultor from "../assets/_beeland_agricultor.png"; // Import image asset


import { useHistory } from 'react-router-dom';

const HomePage = () => {
  const history = useHistory();
  //console.log((localStorage))
  return (
    <div className="content-layout">
      <h1 className="content-title">Bolsa de Polinização Apícola</h1>
      <div className="cards-wrapper">
        <div className="card" onClick={()=> history.push("/dashboard")}>
          <div className='logo-wrapper'>
            <img src={Apicultor} alt="Agricultor" width={150} />
            </div>Apicultor</div>
        <div className="card" onClick={()=> history.push("/dashboard")}>
          <div className='logo-wrapper'>
          <img src={Agricultor} alt="Agricultor" width={150} />
            </div>
            Agricultor</div>
        {/* <div className="card" onClick={()=> history.push("/schedule")}><div className='logo-wrapper'><MdOutlineSchedule  size={35}/></div>Agendamento</div>
        <div className="card" onClick={()=> history.push("/users")}><div className='logo-wrapper'><LuUsers size={35}/></div>Utilizadores</div> */}
      </div>
    </div>
  );
};

export default HomePage;
