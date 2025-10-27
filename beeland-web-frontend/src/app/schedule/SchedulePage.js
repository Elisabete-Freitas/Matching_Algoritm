import React from 'react';
import { MdSettingsRemote, MdOutlineSchedule  } from "react-icons/md";
import { FaCarrot } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";
import { useHistory } from 'react-router-dom';
import Breadcrumb from '../components/breadcrumb/Breadcrumb';

const SchedulePage = () => {
  const history = useHistory();
  return (
    <div className="content-layout">
        <Breadcrumb pageName="Agendamento"/>
      <h1 className="content-title">Agendamento</h1>
      <div className="cards-wrapper">
        <div className="card" onClick={()=> history.push("/addschedule")}>Adicionar Agendamento</div>
      </div>
    </div>
  );
};

export default SchedulePage;
