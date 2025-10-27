import React, { useContext, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import "./Navbar.css"
import logo2 from "../assets/logo.png"; 
import { Link } from 'react-router-dom';
import { AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import { MdOutlineLogout, MdNotifications } from "react-icons/md";
import ModalExit from '../components/modals/ModalExit';
import Agricultor from "../assets/_beeland_agricultor.png";
import Apicultor from "../assets/_beeland_apicultor.png";
import { AuthContext } from '../auth/AuthContext';
import { NotificationsContext } from '../context/NotificationsContext';
import { useHistory } from 'react-router-dom';

function NavbarComponent() {
  const { user, logoutUser } = useContext(AuthContext);
  const { unreadCount, fetchUnreadCount } = useContext(NotificationsContext);
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);

  const handleExitClick = () => {
    setShowModal(true);
  };

  const handleConfirmExit = () => {
    logoutUser();
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const userIcon = user && user.role === 'beekeeper' ? Apicultor : Agricultor;
  const roleText = user && user.role === 'admin' ? 'Administrador' : (user.role === 'beekeeper' ? 'Apicultor' : 'Agricultor');

  const name = user && user.name ? user.name : 'User';

  return (
    <Navbar bg="white" className='navbar-container'>
      <Container className="col-12" style={{ marginLeft: "5px" }}>
        <Link to={user && user.role === 'beekeeper' ? "/dashboard-beekeeper" : "/dashboard-farmer"}>
          <img className='logo-wrapper' src={logo2} alt="Logo" />
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" style={{ textDecoration: 'none', background: "none" }}>
          <Nav className="ml-auto" style={{ padding: 0 }}>
            <div className='user-wrapper'><img src={userIcon} width={50} alt={roleText}></img><span className='user-role-text'>{roleText} <b>{name}</b></span></div>
            {user && user.role !== 'admin' && (
            <div className="notifications-wrapper" onClick={() => history.push("/notifications")}>
              <MdNotifications size={25} color='var(--text-color)' style={{ color: 'var(--text-color)' }} />
              {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
            </div>)}
            <Dropdown alignRight>
              <Dropdown.Toggle variant="link" id="dropdown-basic" style={{ textDecoration: 'none', outline: 'none' }}>
                <AiOutlineUser size={25} color='var(--text-color)' style={{ color: 'var(--text-color)' }} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
  {user && user.role !== 'admin' && (
    <>
      <Dropdown.Item as={Link} to="/profile">Perfil</Dropdown.Item>
     
    </>
  )}
  {user && user.role === 'admin' && (
    <Dropdown.Item as={Link} to="/settings">Definições</Dropdown.Item>
  )}
  <Dropdown.Item onClick={handleExitClick} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
    <div>Sair</div>
    <div><MdOutlineLogout size={22} /></div>
  </Dropdown.Item>
</Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
      {showModal && (
        <ModalExit onClose={handleCloseModal} onConfirm={handleConfirmExit} />
      )}
    </Navbar>
  );
}

export default NavbarComponent;
