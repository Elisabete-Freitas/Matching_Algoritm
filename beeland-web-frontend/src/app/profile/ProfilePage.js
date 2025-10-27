import React, { useState, useEffect } from 'react';
import { LuUsers } from 'react-icons/lu';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../../config';
import './ProfilePage.css';
import { MdEdit } from 'react-icons/md';
import { Bar , Pie, Line } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

import {
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

const ProfilePage = () => {
  const history = useHistory();
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [pollinationsData, setPollinationsData] = useState(null);
  const [requestsFarmer, setRequestsFarmer] = useState(['']);
  const [requests, setRequests] = useState(['']);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filteredRequestsFarmer, setFilteredRequestsFarmer] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [error, setError] = useState('');
  const [cropData, setCropData] = useState(null);


  useEffect(() => {

    const fetchRequestsBeekeper = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.id) {
          console.error("Erro: Nenhum ID de usuário encontrado no localStorage.");
          return;
      }

      try {
          // Altere a URL para usar a rota correta para os pedidos do Beekeeper
          const response = await fetch(
              `${URL}/beeland-api/service-request/all-requests-beekeeper/${storedUser.id}`,  // Alteração para nova rota
              {
                  headers: {
                      "Content-Type": "application/json",
                  }
              }
          );

          if (!response.ok) {
              throw new Error("Erro ao buscar os pedidos de polinização");
          }

          const data = await response.json();
          const requestsArray = Array.isArray(data.serviceRequests) ? data.serviceRequests : [];
          setRequests(requestsArray);
          setFilteredRequests(requestsArray); // Define também os pedidos filtrados inicialmente
      } catch (error) {
          console.error("Erro ao buscar pedidos:", error);
          setError(error.message);
          setRequests([]);
          setFilteredRequests([]);
      }
  };


    const fetchCropData = async (cropType) => {
      try {
          const response = await axios.get(`${URL}/beeland-api/service-request/crops`);
          setCropData(response.data); // Armazena os dados da cultura no estado
          console.log("dados",response.data)
      } catch (error) {
          console.error('Erro ao buscar dados da cultura:', error);
      }
   };

    const fetchRequests = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.id) {
          console.error("Erro: Nenhum ID de usuário encontrado no localStorage.");
          return;
      }

      try {
          const response = await fetch(
              `${URL}/beeland-api/service-request/all-requests-farmer/${storedUser.id}`,
              {
                  headers: {
                      "Content-Type": "application/json",
                  }
              }
          );

          if (!response.ok) {
              throw new Error("Erro ao buscar os pedidos de polinização");
          }

          const data = await response.json();
          const requestsArray = Array.isArray(data.serviceRequests) ? data.serviceRequests : [];
          console.log("Pedidos do Farmer:", requestsArray); 
          setRequestsFarmer(requestsArray);
          setFilteredRequestsFarmer(requestsArray); // Define também os pedidos filtrados inicialmente
      } catch (error) {
          console.error("Erro ao buscar pedidos:", error);
          setError(error.message);
          setRequestsFarmer([]);
          setFilteredRequestsFarmer([]);
      }
  };
 

    const storedUser = JSON.parse(localStorage.getItem('user'));
    //console.log("teste", storedUser.role);
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${URL}/beeland-api/user/profile/${storedUser.id}`
        );
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchPollinationsData = async () => {
      try {
        const response = await axios.get(
          `${URL}/beeland-api/service-request/pollinations-per-month/${storedUser.id}`
        );
        setPollinationsData(response.data.pollinationsPerMonth);
      } catch (error) {
        console.error('Error fetching pollinations data:', error);
      }
    };
    fetchCropData();
    fetchRequests();
    fetchRequestsBeekeper();
    fetchUser();
    fetchPollinationsData();
  }, [id, ]);
  useEffect(() => {
    console.log("Filter Status:", filterStatus);
    console.log("Requests:", requestsFarmer);
    if (filterStatus === "all") {
        setFilteredRequests(requestsFarmer);
    } else {
      const filtered = requestsFarmer.filter(
        (request) => request.status === filterStatus
      );
      console.log("Filtered Requests:", filtered);
      setFilteredRequestsFarmer(filtered);
        
    }
}, [filterStatus, requestsFarmer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSave = () => {
    setEditMode(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Adicione esta função para contar os pedidos por mês
const getAcceptedRequestsByMonth = () => {
  const acceptedRequests = requests.filter(request => request.status === "accepted");
  const countsByMonth = Array(12).fill(0); // Inicializa um array com 12 posições (uma para cada mês)

  acceptedRequests.forEach(request => {
    const month = new Date(request.startDate).getMonth(); // Obtém o mês (0 = Janeiro, 11 = Dezembro)
    countsByMonth[month] += 1; // Incrementa a contagem para o mês correspondente
  });

  return countsByMonth;
};
  const barChartData = {
    labels: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    datasets: [
      {
        label: "Nº de Polinizações Realizadas", // Legenda do gráfico
        data: getAcceptedRequestsByMonth(), // Valores fictícios
        backgroundColor: '#F9CD22',
        borderColor: '#F9CD22',
        borderWidth: 1,
      },
    ],
   };
   const hasData = barChartData.datasets[0].data.some(count => count > 0);
   const staticData = [
    { name: "Encomenda 1", address: "Produtor A", region: "Zona 1", species: "29/05/2024",  status: "Concluido", processoAtual: "Concluido", produtoFinal: "Produto A"},
    { name: "Encomenda 2", address: "Produtor B", region: "Zona 2", species: "29/05/2024",  status: "Concluido",processoAtual: "Concluido", produtoFinal: "Produto A"},
    { name: "Encomenda 3", address: "Produtor C", region: "Zona 3", species: "29/05/2024",  status: "Concluido",processoAtual: "Concluido", produtoFinal: "Produto A"},
    { name: "Encomenda 4", address: "Produtor D", region: "Zona 4", species: "29/05/2024",  status: "Concluido" ,processoAtual: "Concluido", produtoFinal: "Produto A"},
    { name: "Encomenda 5", address: "Produtor E", region: "Zona 5", species: "29/05/2024",  status: "Concluido" ,processoAtual: "Concluido", produtoFinal: "Produto A"},
  ];

  const dataLine = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Receita Mensal (€)',
        data: [120, 0, 200, 0, 200, 300, 150],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const dataPie = {
    labels: ['Pomar', 'Morangal', 'Amendoal', 'Cerejal'],
    datasets: [
      {
        label: 'Distribuição de Tipos de Cultura',
        data: [25, 30, 20, 25],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const data = {
    labels: [
      'Janeiro', 'Febreiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    datasets: [
      {
        label: 'Polinizações por mês',
        data: pollinationsData || [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Número de Polinizações por Mês',
      },
    },
  };

  return (
    <div className="content">
      <div className="profile-container">

        <div className="row">
          <div className="col-md-5 content_profile">
            <div className="row">
              <div className="col-md-9">
                <h4 className="content-title">
                  <LuUsers size={50} color='var(--primary-color)' /> Perfil
                </h4>
              </div>
              <div className="col-md-2">
              <MdEdit
    size={20}
    onClick={() => {
      const userRole = JSON.parse(localStorage.getItem('user'))?.role;
      if (userRole === 'beekeeper') {
        history.push('/beekeeper-edit'); // Redireciona para a página de edição do Beekeeper
      } else if (userRole === 'farmer') {
        history.push('/farmer-edit'); // Redireciona para a página de edição do Farmer
      } else {
        console.error('Role desconhecido ou não autorizado');
      }
    }}
  />
              </div>
            </div>
            {editMode ? (
              <div className="edit-profile">
                <input type="email" name="email" value={user.email} onChange={handleInputChange} />
                <input type="text" name="name" value={user.name} onChange={handleInputChange} />
                <input type="text" name="surname" value={user.surname} onChange={handleInputChange} />
                <input type="text" name="nif" value={user.nif} onChange={handleInputChange} />
                <input type="text" name="address" value={user.address} onChange={handleInputChange} />
                <input type="text" name="postalCode" value={user.postalCode} onChange={handleInputChange} />
                <input type="text" name="locality" value={user.locality} onChange={handleInputChange} />
                <button onClick={handleSave}>Save</button>
              </div>
            ) : (
              <div className="view-profile">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Nome:</strong> {user.name}</p>
            
                <p><strong>NIF:</strong> {user.nif}</p>
                <p><strong>Morada:</strong> {user.address}</p>
                <p><strong>Código Postal:</strong> {user.postalCode}</p>
                <p><strong>Localidade:</strong> {user.locality}</p>
              </div>
            )}
          </div>
          {JSON.parse(localStorage.getItem('user')).role === 'beekeeper' ? (
 <div className="col-md-6 content_profile" style={{backgroundcolor:"#f5f5eb"}}>

{hasData ? (
  <Bar data={barChartData} />
) : (
  <p>Ainda sem dados para mostrar</p>
)}
   {/*
    <div className="chart">
      <div className="content-title">
        <h4>Tipos de Polinização</h4>
      </div>
      <Pie data={dataPie} options={{ maintainAspectRatio: false }} />
    </div>*/}
  </div>
) : (
  <div className="col-md-6 content_profile">
    <div className="content-title">
      <h4>Tipos de Cultura</h4>
    </div>
    <table className="table table-striped">
      <thead>
        <tr>
       
          <th>Tipo de Cultura</th>
          <th>Área</th>
          <th>Tempo de Polinzação</th>
          <th>Colmeias Necessárias</th>
        </tr>
      </thead>
      <tbody>
      {user.farmer.crops && user.farmer.crops.length > 0 ? (
          user.farmer.crops.map((request, index) => {
            // Encontrar a cultura correspondente no cropData
            const cropInfo = cropData?.find(crop => crop.cropType === request.cropType);

            return (
              <tr key={index}>
                <td>{request.cropType}</td>
                <td>{request.cropArea} ha</td>
                <td>{cropInfo ? cropInfo.flowering_time : 'N/A'} dias</td> {/* Exibe a área da cultura se encontrada */}
                <td>
  {cropInfo ? (cropInfo.beehivesNeededPerHectare * request.cropArea) : 'N/A'} Colmeias
</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="2">Nenhum tipo de cultura encontrado.</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}
  </div>
  <div className="row">
  <div className="col-md-12 content_poly">
    <div className="pending-requests">
      {JSON.parse(localStorage.getItem('user'))?.role === 'beekeeper' ? (
        
          <div className="chart">
            <div className="content-title">
              <h4>Pedidos de Polinização</h4>
            </div>
            <div style={{ marginBottom: "20px" }}>
            <label htmlFor="filter">Filtrar por estado: </label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="accepted">Aceite</option>
              <option value="rejected">Rejeitado</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
            <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo de Cultura</th>
                <th>Área da Cultura (Ha)</th>
                <th>Número de Colmeias</th>
                <th>Estado</th>
                <th>Data de Início</th>
                <th>Data de Conclusão</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length !== 0 ? (
                filteredRequests.map((request, index) => (
                  <tr key={request._id}>
                    <td>{index + 1}</td>
                    <td>{request.cropType}</td>
                    <td>{request.farmArea} ha</td>
                    <td>{request.numberOfHivesNeeded}</td>
                    <td>
                      {request.status === "accepted"
                        ? "Aceite"
                        : request.status === "rejected"
                        ? "Rejeitado"
                        : request.status === "pending"
                        ? "Pendente"
                        : "Desconhecido"}
                    </td>
                    <td>{new Date(request.startDate).toLocaleDateString()}</td>
                    <td>{new Date(request.endDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">Nenhum pedido de polinização encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>




          </div>
        
      ) : (
        <div className="row">
          <div className="col-md-10">
            <div className="content-title">
              <h4>Pedidos de Polinização Realizados</h4> {/* Exibe título para o outro tipo de usuário */}
            </div>
          </div>
        </div>
      )}
      {/* Aqui você pode adicionar a parte de filtro e a tabela para o outro tipo de usuário */}
      {JSON.parse(localStorage.getItem('user'))?.role !== 'beekeeper' && (
        <>
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="filter">Filtrar por estado: </label>
            <select
              id="filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="accepted">Aceite</option>
              <option value="rejected">Rejeitado</option>
              <option value="pending">Pendente</option>
            </select>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo de Cultura</th>
                <th>Área da Cultura (Ha)</th>
                <th>Número de Colmeias</th>
                <th>Estado</th>
                <th>Data de Início</th>
                <th>Data de Término</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequestsFarmer.length !== 0 ? (
                filteredRequestsFarmer.map((request, index) => (
                  <tr key={request._id}>
                    <td>{index + 1}</td>
                    <td>{request.cropType}</td>
                    <td>{request.farmArea} ha</td>
                    <td>{request.numberOfHivesNeeded}</td>
                    <td>
                      {request.status === "accepted"
                        ? "Aceite"
                        : request.status === "rejected"
                        ? "Rejeitado"
                        : request.status === "pending"
                        ? "Pendente"
                        : "Desconhecido"}
                    </td>
                    <td>{new Date(request.startDate).toLocaleDateString()}</td>
                    <td>{new Date(request.endDate).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">Nenhum pedido de polinização encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  </div>
</div>

          </div>
          
        </div>
     
  );
};

export default ProfilePage;
