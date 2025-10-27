import React from 'react';
import { MdSettingsRemote, MdOutlineSchedule  } from "react-icons/md";
import { FaCarrot } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";
import { useHistory } from 'react-router-dom';

const ProfilePage = () => {
  const history = useHistory();
  return (
    <div className="content-layout">
      <h1 className="content-title">Perfil</h1>
      <div className="cards-wrapper">
        <div className="card" onClick={()=> history.push("/addschedule")}>Editar Utilizador</div>
      </div>
    </div>
  );
};

export default ProfilePage;
