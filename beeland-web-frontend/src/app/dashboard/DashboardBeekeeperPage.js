import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Map from "../components/Map";
import Apicultor from "../assets/_beeland_apicultor.png";
import LegendMap from "./LegendMap";
import "./DashboardPage.css";
import { URL } from "../../config";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import Spinner from "../shared/Spinner";

const DashboardBeekeeperPage = () => {
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [beekeeperData, setBeekeeperData] = useState({});
  const [beekeeperStats, setBeekeeperStats] = useState({});
  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const history = useHistory();
  const userId = JSON.parse(localStorage.getItem("user")).id;

  const options =  {
    month: "long",
    day: "2-digit",
  }

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        getBeekeeperData(),
        getBeekeeperStats(),
        getAllFarmers(),
        getOngoingRequests(),
        getPendingRequests(),
      ]);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const getBeekeeperStats = async () => {
    try {
      const response = await fetch(`${URL}/beeland-api/beekeeper/stats`);
      const data = await response.json();
      setBeekeeperStats(data);
    } catch (error) {
      console.error("Error fetching beekeeper stats:", error);
    }
  };

  const getBeekeeperData = async () => {
    try {
      const response = await fetch(`${URL}/beeland-api/user/${userId}`);
      const data = await response.json();
      const responseLatlong = await fetch(
        `${URL}/beeland-api/user/latlong/${userId}`
      );
      const latlong = await responseLatlong.json();
      setBeekeeperData({ ...data, ...latlong });
    } catch (error) {
      console.error("Error fetching beekeeper data:", error);
    }
  };

  const getAllFarmers = async () => {
    try {
      const response = await fetch(`${URL}/beeland-api/farmer/all`);
      const data = await response.json();
      setFarmers(data);
    } catch (error) {
      console.error("Error fetching farmers:", error);
    }
  };

  const getOngoingRequests = async () => {
    try {
      const response = await fetch(
        `${URL}/beeland-api/service-request/ongoing/${userId}`
      );
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching ongoing requests:", error);
    }
  };

  const getPendingRequests = async () => {
    try {
      const response = await fetch(
        `${URL}/beeland-api/service-request/pending/${userId}`
      );
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

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

      await getOngoingRequests();
      await getPendingRequests();
      await getBeekeeperStats();
    } catch (error) {
      console.error("Error updating request status:", error);
    }
  };

  const openConfirmationModal = (request, action) => {
    setModalOpen(true);
    setSelectedRequest(request);

    if (action === "accepted") {
      setModalTitle("Confirmar Aceitação");
      setModalMessage("Tem certeza de que deseja aceitar este pedido?");
      setConfirmAction(
        () => () => confirmActionHandler(request._id, "accepted")
      );
    } else {
      setModalTitle("Confirmar Rejeição");
      setModalMessage("Tem certeza de que deseja recusar este pedido?");
      setConfirmAction(
        () => () => confirmActionHandler(request._id, "rejected")
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

  if (isLoading) {
    return (
      <div>
        <Spinner />
      </div>
    ); // Replace with Spinner if available
  }
console.log("services,",beekeeperData);
  return (
    <div className="dashboard-container">
      <div className="map-container">
        <Map
          distanceRadius={beekeeperData.serviceArea}
          data={farmers}
          userLatLong={beekeeperData}
        />
        <LegendMap role="Beekeeper" />
      </div>
      <div className="col-12 dashboard-wrapper">
        <div className="col-xl-2 col-md-12 col-sm-12 filter-wrapper" id="item-1">
          <div className="yellow-card">
            <img src={Apicultor} alt="Hive Icon" />
            <h1>As minhas colmeias</h1>
            <div className="data-section">
              <span>N.º Serviços de Polinização:</span>{" "}
              <strong>{services.length}</strong>
            </div>
            <div className="data-section">
              <span>Total Colmeias:</span>{" "}
              <strong>{beekeeperData.beekeeper.hiveCount}</strong>
            </div>
            <div className="data-section-active">
              <div className="data-section">
                <span>Disponíveis: </span>
                <strong style={{ color: "var(--success-color)" }}>
                  {beekeeperData.beekeeper.hiveCount - beekeeperData.beekeeper.hivesReserved}
                </strong>
              </div>
              <div className="data-section">
                <span>Em polinização:</span>{" "}
                <strong style={{ color: "var(--select-color)" }}>
                  {beekeeperData.beekeeper.hivesReserved}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-10 col-md-12 col-sm-12 table-wrapper beekeeper-table" id="item-2">
          <h3>
            Serviço de Polinização <span className="active-span">Ativos</span>
          </h3>
          <table>
            <thead>
              <tr>
                <th>Agricultor</th>
                <th>Localização</th>
                <th>Cultura</th>
                <th>Área da Cultura</th>
                <th>Período de Polinização</th>
              </tr>
            </thead>
            <tbody>
              {services.length > 0 ? (
                services.map((service) => (
                  <tr key={service._id}>
                    <td>
                      {service.farmer.name} {service.farmer.lastname}
                    </td>
                    <td>{service.farmer.locality}</td>
                    <td>{service?.cropType}</td>
                    <td>{service.farmArea}Ha</td>
                    <td>{`${new Date(service.startDate).toLocaleDateString("pt-PT",options)} -- ${new Date(
                      service.endDate).toLocaleDateString("pt-PT", options)}`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">Não há serviços ativos.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h3
            style={{ background: "var(--primary-color)", marginTop: "0.8rem" }}
          >
            Pedidos de Polinização
          </h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Agricultor</th>
                <th>Localização</th>
                <th>Detalhes</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      {request.farmer.name} {request.farmer.lastname}
                    </td>
                    <td>{request.farmer.locality}</td>
                    <td>{`${request?.cropType} - ${
                      request.farmArea
                    } hectares - ${new Date(
                      request.startDate
                    ).toLocaleDateString( "pt-PT",
                      options)} até ${new Date(
                      request.endDate
                    ).toLocaleDateString( "pt-PT",
                      options)}`}</td>
                    <td>
                      <button
                        className="button-reject"
                        onClick={() =>
                          openConfirmationModal(request, "rejected")
                        }
                      >
                        Recusar
                      </button>
                      <button
                        className="button-accept"
                        onClick={() =>
                          openConfirmationModal(request, "accepted")
                        }
                      >
                        Aceitar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">Não há pedidos pendentes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/*
        <div className="col-xl-2 col-md-12 col-sm-12 indicators-wrapper" id="item-3">
          <div className="indicator">
            <div className="indicator-label">N.º Apicultores</div>
            <div className="indicator-value">
              {beekeeperStats.totalBeekeepers}
            </div>
          </div>
          <div className="indicator">
            <div className="total-colmeias">Total Colmeias</div>
            <div className="indicator-value">{beekeeperStats.totalHives}</div>
          </div>
          <div className="indicator-available-status">
            <div className="indicator">
              <div className="disponiveis-label">Disponíveis</div>
              <div className="available">
                {beekeeperStats.totalAvailableHives}
              </div>
            </div>
            <div className="indicator">
              <div className="reservadas-label">Reservadas</div>
              <div className="reserved">
                {beekeeperStats.totalReservedHives}
              </div>
            </div>
          </div>
        </div>*/}
      </div>
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
  );
};

export default DashboardBeekeeperPage;
