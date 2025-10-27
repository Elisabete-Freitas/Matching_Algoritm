import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { URL } from '../../config';
import './Pollination.css'; 
import ConfirmationModal from "../components/modals/ConfirmationModal";

const Pollination = () => {
  const [pollinations, setPollinations] = useState([]);
  const [filteredPollinations, setFilteredPollinations] = useState([]);
  const [farmers, setFarmers] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    state: '',
    farmer: '',
    cropType: ''
  });

  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(
        `${URL}/beeland-api/service-request/${requestId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: action }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update service request.");
      }

      //await fetchPollinationsData();
      //await getPendingRequests();
      //await getBeekeeperStats();
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const openConfirmationModal = (pollination, action) => {
    setModalOpen(true);
    setSelectedRequest(pollination);

    if (action === "accepted") {
      setModalTitle("Confirmar Aceitação");
      setModalMessage("Tem certeza de que deseja aceitar este pedido?");
      setConfirmAction(
        () => () => confirmActionHandler(pollination._id, "accepted")
      );
    } else {
      setModalTitle("Confirmar Rejeição");
      setModalMessage("Tem certeza de que deseja recusar este pedido?");
      setConfirmAction(
        () => () => confirmActionHandler(pollination._id, "rejected")
      );
    }
  };
  const confirmActionHandler = async (requestId, action) => {
    await handleRequestAction(requestId, action);
    setModalOpen(false);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const fetchPollinationsData = async () => {
      try {
        const response = await axios.get(
          `${URL}/beeland-api/service-request/all-requests-beekeeper/${storedUser.id}`
        );
        setPollinations(response.data.serviceRequests);
        setFilteredPollinations(response.data.serviceRequests);
      } catch (error) {
        console.error('Error fetching pollinations data:', error);
      }
    };

    fetchPollinationsData();
  }, []);

  useEffect(() => {
    const fetchFarmerData = async (farmerId) => {
      try {
        const response = await axios.get(`${URL}/beeland-api/user/profile/${farmerId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching farmer data:', error);
        return null;
      }
    };
  
    const fetchAllFarmers = async () => {
      const farmerPromises = pollinations.map(async (pollination) => {
        if (!farmers[pollination.farmer]) {
          const farmerData = await fetchFarmerData(pollination.farmer);
          return { [pollination.farmer]: farmerData };
        }
        return null;
      });
  
      const farmersArray = await Promise.all(farmerPromises);
      const validFarmersArray = farmersArray.filter(farmer => farmer !== null);
      const farmersObject = validFarmersArray.reduce((acc, farmer) => ({ ...acc, ...farmer }), {});
      setFarmers(prevFarmers => ({ ...prevFarmers, ...farmersObject }));
      setLoading(false);
    };
  
    if (pollinations.length > 0) {
      fetchAllFarmers();
    }
  }, [pollinations, farmers]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const filteredPollinations = pollinations.filter((pollination) => {
      const pollinationStartDate = new Date(pollination.startDate);
      const pollinationEndDate = new Date(pollination.endDate);

      const isWithinDateRange =
        (!filter.startDate || new Date(filter.startDate) <= pollinationStartDate) &&
        (!filter.endDate || new Date(filter.endDate) >= pollinationEndDate);

      const matchesState = !filter.state || farmers[pollination.farmer]?.address.includes(filter.state);
      const matchesFarmer = !filter.farmer || farmers[pollination.farmer]?.name.includes(filter.farmer);
      const matchesCropType = !filter.cropType || pollination.cropType.includes(filter.cropType);

      return isWithinDateRange && matchesState && matchesFarmer && matchesCropType;
    });

    setFilteredPollinations(filteredPollinations);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container2">
    <div className="row filter-container2 align-items-center">
      <h5 className="content-title2">Filtros</h5>
      <form className="row g-3" onSubmit={handleFilterSubmit}>
        <div className="col-md-2">
          <label>Data Início:</label>
          <input className="form-control" type="date" value={filter.startDate} onChange={(e) => setFilter({...filter, startDate: e.target.value})} />
        </div>
        <div className="col-md-2">
          <label>Data Fim:</label>
          <input className="form-control" type="date" value={filter.endDate} onChange={(e) => setFilter({...filter, endDate: e.target.value})} />
        </div>
        <div className="col-md-2">
          <label>Estado:</label>
          <input className="form-control" type="text" value={filter.state} onChange={(e) => setFilter({...filter, state: e.target.value})} />
        </div>
        <div className="col-md-2">
          <label>Agricultor:</label>
          <input className="form-control" type="text" value={filter.farmer} onChange={(e) => setFilter({...filter, farmer: e.target.value})} />
        </div>
        <div className="col-md-2">
          <label>Tipo de Cultura:</label>
          <input className="form-control" type="text" value={filter.cropType} onChange={(e) => setFilter({...filter, cropType: e.target.value})} />
        </div>
        <div className="col-md-2 d-flex align-items-end">
          <button className="btn btn-primary w-100" type="submit">Aplicar Filtros</button>
        </div>
      </form>
 
      </div>
      <div className="pollinations-table-container table-wrapper2">
        <h5 className="content-title2">Polinizações Realizadas</h5>
        <table className="pollinations-table">
          <thead>
            <tr>
              <th>Data Início</th>
              <th>Data de Fim</th>
              <th>Localização</th>
              <th>Agricultor</th>
              <th>Tipo de Cultura</th>
              <th>Área</th>
              <th>Status</th> 
              <th>Ações</th>
            </tr>
          </thead>
          <tbody className="table-body-wrapper2">
            {filteredPollinations?.map((pollination, index) => (
              <tr key={index} className="table-row-wrapper2">
                <td>{new Date(pollination.startDate).toLocaleDateString()}</td>
                <td>{new Date(pollination.endDate).toLocaleDateString()}</td>
                <td>{farmers[pollination.farmer]?.address || 'Carregando...'}</td>
                <td>{farmers[pollination.farmer]?.name || 'Carregando...'}</td>
                <td>{pollination.cropType}</td>
                <td>{pollination.farmArea}</td>
                <td>{pollination.status}</td>
                {pollination.status === "pending" && (
                <td>
                      <button
                        className="col-5 button-reject"
                        onClick={() =>
                          openConfirmationModal(pollination, "rejected")
                        }
                      >
                        Recusar
                      </button>
                      <button
                        className="col-5 button-accept"
                        onClick={() =>
                          openConfirmationModal(pollination, "accepted")
                        }
                      >
                        Aceitar
                      </button>
                    </td>
                      )}
              </tr>
            ))}
          </tbody>
        </table>
        <ConfirmationModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={confirmAction}
        messageTitle={modalTitle}
        messageContent={<p>{modalMessage}</p>}
        type="confirm"
        status="confirm"
      />
      </div>
    </div>
  );
};

export default Pollination;
