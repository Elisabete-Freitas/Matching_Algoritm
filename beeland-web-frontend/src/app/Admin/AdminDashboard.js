import React, { useState, useEffect } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { BsFillTrashFill } from "react-icons/bs";
import { URL } from "../../config";
import "./Admin.css";

// Componente para os botões de confirmação do modal
const ModalButtons = ({ onConfirm, onCancel }) => (
  <div className="modal-buttons-wrapper">
    <button className="btn-ok" onClick={onConfirm}>
      Sim
    </button>
    <button className="btn-no" onClick={onCancel}>
      Não
    </button>
  </div>
);

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [usersDesactive, setUsersDesactive] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isActivationModalOpen, setActivationModalOpen] = useState(false);
  const [isConfirmActivationModalOpen, setConfirmActivationModalOpen] = useState(false);
  const [userToActivate, setUserToActivate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsersData = async (status) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${URL}/beeland-api/farmer/${status}`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      status === "active" ? setUsers(data) : setUsersDesactive(data);
    } catch (error) {
      setError(`Erro ao buscar utilizadores ${status}.`);
      console.error(`Error fetching ${status} users:`, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateUser = (user) => {
    setUserToActivate(user);
    setConfirmActivationModalOpen(true);
  };

  const confirmActivateUser = async () => {
    if (!userToActivate) return;

    try {
      const response = await fetch(`${URL}/beeland-api/user/activate-user/${userToActivate._id}`, {
        method: "PUT",
      });
      if (response.ok) {
        fetchUsersData("active");
        fetchUsersData("desactive");
        setActivationModalOpen(true);
      } else {
        console.error("Falha ao ativar o utilizador.");
      }
    } catch (error) {
      console.error("Erro ao ativar utilizador:", error.message);
    } finally {
      setConfirmActivationModalOpen(false);
      setUserToActivate(null);
    }
  };

  const handleDeleteUser = (userId) => {
    setUserToDelete(userId);
    setIsModalOpen(true);
  };
  

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await fetch(`${URL}/beeland-api/user/delete/${userToDelete}`, { method: "DELETE" });
      setIsModalOpen(false);
      fetchUsersData("active");
      fetchUsersData("desactive");
    } catch (error) {
      console.error("Error deleting user:", error.message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  const closeActivationModal = () => {
    setActivationModalOpen(false);
  };

  const confirmAndCloseActivation = async () => {
    await confirmActivateUser();
    closeActivationModal();
  };

  useEffect(() => {
    fetchUsersData("active");
    fetchUsersData("desactive");
  }, []);

  return (
    <div>
      {isLoading && <div className="loading">A carregar...</div>}
      {error && <div className="error">{error}</div>}

      {/* Tabela de utilizadores ativos */}
      <div className="card-table-header" style={{marginTop:"2%"}}>
      <h3>Utilizadores Ativos</h3>
        <h3>Utilizadores Ativos</h3>
      </div>
      
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Localidade</th>
              <th>Nif</th>
              <th>Contacto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role === "farmer" ? "Agricultor" : user.role === "beekeeper" ? "Apicultor" : user.role}</td>
                <td>{user.locality}</td>
                <td>{user.nif}</td>
                <td>{user.phone}</td>
                <td>
                  <BsFillTrashFill
                    title="Apagar Uitlizador"
                    onClick={() => handleDeleteUser(user._id)}
                    style={{ cursor: "pointer", color: "rgb(209, 3, 3)" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabela de utilizadores desativos */}
      <div className="card-table-header">
        <h3>Utilizadores Inativos</h3>
      </div>
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Localidade</th>
              <th>Nif</th>
              <th>Contacto</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usersDesactive.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role === "farmer" ? "Agricultor" : user.role === "beekeeper" ? "Apicultor" : user.role}</td>
                <td>{user.locality}</td>
                <td>{user.nif}</td>
                <td>{user.phone}</td>
                <td>
                  <AiOutlineCheck
                    title="Ativar Utilizador"
                    onClick={() => handleActivateUser(user)}
                    style={{ cursor: "pointer", color: "green" }}
                  />
                  <BsFillTrashFill
                    title="Apagar Uitlizador"
                    onClick={() => handleDeleteUser(user._id)}
                    style={{ cursor: "pointer", color: "rgb(209, 3, 3)" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmação de exclusão */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={handleCancel}>
              &times;
            </button>
            <h3 className="modal-header">Tem a certeza que pretende eliminar o utilizador {users.find(user => user._id === userToDelete)?.name}?</h3>
            <ModalButtons onConfirm={handleConfirmDelete} onCancel={handleCancel} />
          </div>
        </div>
      )}

      {/* Modal de confirmação de ativação */}
      {isConfirmActivationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-button"
              onClick={() => {
                setConfirmActivationModalOpen(false);
                setUserToActivate(null);
              }}
            >
              &times;
            </button>
            <h3 className="modal-header">
              Tem a certeza que pretende ativar o utilizador {userToActivate?.name}?
            </h3>
            <ModalButtons
              onConfirm={confirmAndCloseActivation}
              onCancel={() => {
                setConfirmActivationModalOpen(false);
                setUserToActivate(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmação de ativação concluída */}
      {isActivationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close-button" onClick={closeActivationModal}>
              &times;
            </button>
            <h3 className="modal-header">Utilizador ativado com sucesso!</h3>
            <ModalButtons onConfirm={closeActivationModal} onCancel={closeActivationModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersAdmin;
