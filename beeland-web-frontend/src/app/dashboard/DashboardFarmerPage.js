import React, { useState, useEffect , useMemo} from "react";
import { useHistory } from "react-router-dom";
import Map from "../components/Map";
import Spinner from "../shared/Spinner";
import { URL } from "../../config";
import "./DashboardPage.css";
import LegendMap from "./LegendMap";
//import ConfirmationModal from "../components/modals/ConfirmationModal";
import ServiceRequestModal from "../Modal/ServiceRequestModal";
import SuccessModal from "../Modal/SucessModal";



const DashboardFarmerPage = () => {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [farmer, setFarmer] = useState([]);
  const [beekeeperStats, setBeekeeperStats] = useState([]);
  const [beekeepers, setBeekeepers] = useState([]);
  const [beehivesPerCulture, setBeehivesPerCulture] = useState([]);
  const [nearBeekeepers, setNearBeekeepers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenRequest, setModalOpenRequest] = useState(false);
  const [modalType, setModalType] = useState("confirm");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [selectedBeekeeper, setSelectedBeekeeper] = useState(null);
  const [filteredBeekeepers, setFilteredBeekeepers] = useState([]);
  const [modalOpenSucess, setModalOpenSucess] = useState(false); 
  const [selectedSpecies, setSelectedSpecies] = useState("Kiwi");







  const [filters, setFilters] = useState({
    zone: "",
    cultureType: "",
    area: "",
    startDate: "",
    endDate: "",
  });
  const [modalFilters, setModalFilters] = useState({
    cultureType: "",
    area: "",
    startDate: "",
    endDate: "",
  });
  
  const formatDate = (date) => new Date(date).toISOString().split('T')[0];


const user = JSON.parse(localStorage.getItem("user")); // transforma a string de volta em objeto
const userId = user?.id;

console.log("user",user); // Deve ter a chave `id`
console.log("userId",userId); // Deve imprimir um valor como "6867d81401001c01b8ea0595"



  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  
  
  
  useEffect(() => {
     console.log("dados farmer",farmer) 

    
  const fetchData = async () => {
  setIsLoading(true);
  await getBeehivesPerCulture(); // ← Primeiro, pois é dependência
  await getFarmerData();         // ← Segundo
  await getBeekeeperStats();
  await getAllBeekeepers();
  setIsLoading(false);
};
    fetchData();
    getModalContent();
   

   
  }, [filters.startDate, filters.endDate, filters, modalFilters.cultureType, selectedSpecies]);
  

  useEffect(() => {
    if (farmer?.lat && farmer?.long && beehivesPerCulture.length > 0) {
      getNearestBeekeepers();
    }
   
  }, [farmer?.lat, farmer?.long, beehivesPerCulture, filters.startDate]);

 const applyFilters = () => {
  const { zone, cultureType, area, startDate, endDate } = filters;
  // Verifique os valores dos filtros
  const filtered = nearBeekeepers.filter((bk) => {
    // Filtrar por zona
    if (zone && (!bk.zone || !bk.zone.includes(zone))) return false;

    // Filtrar por tipo de cultura
    if (cultureType && bk.cropType !== cultureType) return false;

    // Filtrar por área mínima
    if (area && bk.hivesNeeded < Number(area)) return false;

    // Filtrar por data
    if (startDate && new Date(bk.date) < new Date(startDate)) return false;
    if (endDate && new Date(bk.date) > new Date(endDate)) return false;

    return true;
  });

  setFilteredBeekeepers(filtered);
};
  

  useEffect(() => {
    applyFilters();

  }, [filters, nearBeekeepers]);

 const getFarmerData = async () => {
  
  try {
    const response = await fetch(`${URL}/beeland-api/user/${userId}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do agricultor: ${response.status}`);
    }

    const data = await response.json();

    const responseLatlong = await fetch(`${URL}/beeland-api/user/latlong/${userId}`);

    if (!responseLatlong.ok) {
      throw new Error(`Erro ao buscar lat/long: ${responseLatlong.status}`);
    }

    const latlong = await responseLatlong.json();

    setFarmer({ ...data, ...latlong });

  } catch (error) {
    console.error("Erro ao buscar dados do agricultor:", error);
  }
};


  const getBeekeeperStats = async () => {
    const response = await fetch(`${URL}/beeland-api/beekeeper/stats`);
    const data = await response.json();
    setBeekeeperStats(data);
  };

  const getAllBeekeepers = async () => {
    const response = await fetch(`${URL}/beeland-api/beekeeper/all`);
    const data = await response.json();
    //console.log(data);
   
    setBeekeepers(data);
  };
const getNearestBeekeepers = async () => {
  try {
    // 1. Buscar a cultura correspondente ao selectedSpecies
    const crop = farmer?.farmer?.crops?.find(
      (c) => c.cropType?.toLowerCase() === selectedSpecies?.toLowerCase()
    );

    // 2. Obter a área da cultura (cropArea)
    const area = crop?.cropArea ?? 0;

    if (area <= 0) {
      console.warn("Área inválida ou não encontrada para:", selectedSpecies);
      return;
    }

    // 3. Buscar info da espécie nas configurações
    const cropInfo = beehivesPerCulture.find(
      (c) => c.cropType?.toLowerCase() === selectedSpecies?.toLowerCase()
    );

    if (!cropInfo) {
      console.warn("Espécie não encontrada em beehivesPerCulture:", selectedSpecies);
      return;
    }

    // 4. Calcular o número de colmeias necessárias
    const hivesNeeded = Math.ceil(cropInfo.beehivesNeededPerHectare * area);

    // 5. Construir URL
    let url = `${URL}/beeland-api/beekeeper/nearest-beekeepers?lat=${farmer.lat}&lon=${farmer.long}`;

    if (hivesNeeded) {
      url += `&colmeiasNecessarias=${hivesNeeded}`;
    }

    if (selectedSpecies && selectedSpecies !== "Todas") {
      url += `&species=${encodeURIComponent(selectedSpecies)}`;
    }

    console.log("Final URL:", url);

    // 6. Fazer o fetch
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch nearest beekeepers");

    const data = await response.json();

    updateBeekeepersWithHiveRequirements(data);
    console.log("Near Beekeepers:", data);
    applyFilters();
  } catch (error) {
    console.error("Error fetching nearest beekeepers:", error);
  }
};



  
const updateBeekeepersWithHiveRequirements = (beekeepers) => {
  const updatedBeekeepers = beekeepers.map((bk) => {
    // Procura pela cultura selecionada no filtro
    const cropInfo = beehivesPerCulture.find(
      (c) => c.cropType === filters.cultureType // Verifica com base no filtro
    );

    // Calcula o número de colmeias necessárias usando a área do filtro
    const hivesNeeded = cropInfo
      ? Math.ceil(cropInfo.beehivesNeededPerHectare * (filters.area || 0)) // Usa a área do filtro
      : 0;

    // Retorna o apicultor com o número de colmeias necessárias
    return { ...bk, hivesNeeded: hivesNeeded };
  });

  console.log("Updated Beekeepers:", updatedBeekeepers); // Verifique os dados aqui
  setNearBeekeepers(updatedBeekeepers);
};
const getBeehivesPerCulture = async () => {
  setIsLoading(true);
  try {
    const response = await fetch(`${URL}/beeland-api/settings/hives-per-culture`);
    if (!response.ok) {
      throw new Error('Failed to fetch crop info');
    }
    const data = await response.json();
    console.log("Beehives Per Culture:", data); // Verifique os dados aqui
    setBeehivesPerCulture(data); // Armazena as informações das culturas
    setIsLoading(false);
  } catch (error) {
    console.error('Error fetching crop info:', error);
    setIsLoading(false);
  }
};
  
 const handleAgendarClick = (beekeeper) => {
  if (beekeeper.hivesNeeded > (beekeeper.beekeeper.hiveCount - beekeeper.beekeeper.hivesReserved)) {
      alert("O apicultor não possui colmeias suficientes disponíveis.");
      return;
  }

  // Encontrar a cultura correspondente
  const selectedCrop = farmer?.farmer?.crops?.find(
    (c) => c.cropType?.toLowerCase() === selectedSpecies?.toLowerCase()
  );

  // Atualizar modalFilters automaticamente com cultura selecionada
  setModalFilters({
    cultureType: selectedCrop?.cropType || "",
    area: selectedCrop?.cropArea || "",
    startDate: "",
    endDate: "",
  });

  setSelectedBeekeeper(beekeeper);
  setModalType("confirm");
  setMessageTitle("Confirmação");
  setMessageContent(getModalContent());
  setModalOpenRequest(true);
};



const getModalContent = () => {
  if (!selectedBeekeeper) {
    return <p>Erro: Nenhum apicultor selecionado.</p>;
}

return (
  <>
      <p>Tem a certeza que deseja solicitar este serviço ao Apicultor:</p>
      <p><b>{selectedBeekeeper?.name} {selectedBeekeeper?.lastname}</b></p>
      <label>
      <select
    value={modalFilters.cultureType}
    onChange={(e) => {
      const selectedOption = JSON.parse(e.target.value);
      setModalFilters((prevFilters) => {
          const updatedFilters = {
              ...prevFilters,
              cultureType: selectedOption.cropType,
              area: selectedOption.area,
          };
          //console.log("Atualizando modalFilters (select):", updatedFilters);
          return updatedFilters;
      });
  }}
  
>
              <option value="" disabled>Selecione uma Cultura</option>
              {farmer?.crops?.map((culture, index) => (
                  <option 
                      key={culture._id || index} 
                      value={JSON.stringify({ cropType: culture.cropType, area: culture.cropArea })}>
                      {culture.cropType}
                  </option>
              ))}
          </select>
      </label>
      <label>
          Data de Início:
          <input
              type="date"
              name="startDate"
              value={modalFilters.startDate || ""}
              onChange={(e) => {
                  const value = e.target.value;
                  setModalFilters((prevFilters) => ({
                      ...prevFilters,
                      startDate: value,
                  }));
              }}
          />
      </label>
      <label>
          Data de Fim:
          <input
              type="date"
              name="endDate"
              value={modalFilters.endDate || ""}
              onChange={(e) => {
                  const value = e.target.value;
                  setModalFilters((prevFilters) => ({
                      ...prevFilters,
                      endDate: value,
                  }));
              }}
          />
      </label>
  </>
);

}
  

const handleConfirm = async () => {
  if (!modalFilters.startDate || !modalFilters.endDate) {
    setMessageTitle("Erro nas Datas");
    setMessageContent("Por favor, insira as datas de início e fim do período de polinização.");
    setModalType("error");
    setModalOpen(true);
    return;
  }

  try {
    const responseCrop = await fetch(`${URL}/beeland-api/settings/crop-data/${modalFilters.cultureType}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!responseCrop.ok) {
      throw new Error('Não foi possível buscar os dados da cultura');
    }

    const cropData = await responseCrop.json();

    const serviceData = {
      farmerId: userId,
      beekeeperId: selectedBeekeeper._id,
      cropType: modalFilters.cultureType,
      farmArea: modalFilters.area,
      startDate: modalFilters.startDate,
      endDate: modalFilters.endDate,
      pollinationStart: modalFilters.startDate,
      pollinationEnd: modalFilters.endDate,
      beehivesNeededPerHectare: cropData.beehivesNeededPerHectare,
    };

    const responseService = await fetch(`${URL}/beeland-api/service-request/create-new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...serviceData,
        startDate: formatDate(serviceData.startDate),
        endDate: formatDate(serviceData.endDate),
        pollinationStart: formatDate(serviceData.pollinationStart),
        pollinationEnd: formatDate(serviceData.pollinationEnd),
      }),
    });

    if (!responseService.ok) {
      throw new Error('Falha ao criar o pedido de serviço');
    }
    setModalOpenRequest(false);
    setModalOpenSucess(true); 
    setMessageTitle("Requisição Criada");
    setMessageContent("Requisição criada com sucesso!");
    setModalType("success"); // Define o tipo como "success"
    setModalOpen(true); // Abre o modal de sucesso
  } catch (error) {
    setMessageTitle("Erro");
    setMessageContent("Algo inesperado ocorreu, por favor tente mais tarde.");
    setModalType("error");
    setModalOpen(true);
  }
};

  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleCloseModalRequest = () => {
    setModalOpenRequest(false);
  };

console.log("farmer",farmer?.farmer?.crops);
const cropSpecies = Array.isArray(farmer?.farmer?.crops)
  ? [
      ...new Set(
        farmer.farmer.crops
          .map((crop) => crop.cropType)
          .filter(Boolean)
      )
    ]
  : [];





console.log("teste", cropSpecies)
  return (
    <div className="dashboard-container">
      <div className="map-container">
        <Map data={filteredBeekeepers} userLatLong={farmer} />
        <LegendMap role="Farmer" />
      </div>
     
      <div className="col-12 dashboard-wrapper">
         {/*
        <div className="col-xl-2 col-md-3 col-sm-12 filter-wrapper">
          <h3>Filtros</h3>
            <select name="zone" onChange={handleFilterChange}>
            <option value="" disabled hidden>
              Selecione a zona do país
            </option>
            <option value="">Todas as zonas</option>

            <option value="norte">Norte</option>
            <option value="centro">Centro</option>
            <option value="sul">Sul</option>
          </select>

          <select name="cultureType" onChange={handleFilterChange}>
            <option value="" disabled hidden>
              Tipo de Cultura
            </option>
            <option value="">Todos os tipos</option>

            <option value="amendoal">Amêndoal</option>
            <option value="cerejal">Cerejal</option>
            <option value="pomar">Pomar</option>
            <option value="morangal">Morangal</option>
          </select>
          <input
            type="number"
            name="area"
            placeholder="Área (ha)"
            onChange={handleFilterChange}
          />
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
         <h3>Período</h3>

          <input type="date" name="startDate" onChange={handleFilterChange} />

          <input type="date" name="endDate" onChange={handleFilterChange} />
        </div>
*/}
       <div className="col-xl-10 col-md-8 col-sm-8 table-wrapper" >
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", background: "#efefeb" }}>
    
    <h3 style={{ margin: 0 }}>Apicultores Disponíveis na sua zona</h3>

    <div className="species-selector" style={{ display: "flex", alignItems: "center", gap: "0.5rem" , marginRight:"0.5rem"}}>
      <label>Espécie:</label>
      <select value={selectedSpecies} onChange={(e) => setSelectedSpecies(e.target.value)}>
        <option value="Todas">Todas</option>
        {cropSpecies.map((species, index) => (
          <option key={index} value={species}>
            {species}
          </option>
        ))}
      </select>
    </div>

  </div>

          <table className="styled-table">
            <thead>
              <tr>
                <th>Apicultor</th>
                <th>Localidade</th>
                <th>Distância</th>
                <th>Disponíveis</th>
                {/* <th>Necessárias</th>*/}
                <th>Preço mensal por colmeia</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBeekeepers.map((bk, index) => (
                <tr key={index}>
                  <td>{bk.name} {bk.lastname}</td>
                  <td>{bk.locality}</td>
                  <td>{(bk.distance / 1000).toFixed(0)} km</td>
                  <td style={{color: bk.hivesNeeded > (bk.beekeeper.hiveCount - bk.beekeeper.hivesReserved) ? "var(--error-color)" : "var(--focus-color)"}}><b>{bk.beekeeper.hiveCount - bk.beekeeper.hivesReserved}</b></td>
                 {/*   <td>{bk.hivesNeeded}</td> */}
                  <td>{bk.beekeeper.serviceRate}€</td>
                  <td>
                    <button
                      className={bk.hivesNeeded <= (bk.beekeeper.hiveCount - bk.beekeeper.hivesReserved) ? "btn-available" : "btn-reserved"}
                      onClick={() => handleAgendarClick(bk)}
                      disabled={bk.hivesNeeded > (bk.beekeeper.hiveCount - bk.beekeeper.hivesReserved)}
                    >
                      Agendar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-xl-2 col-md-6 col-sm-12 indicators-wrapper">
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
              <div className="available">{beekeeperStats.totalAvailableHives}</div>
            </div>
            <div className="indicator">
              <div className="reservadas-label">Reservadas</div>
              <div className="reserved">{beekeeperStats.totalReservedHives}</div>
            </div>
          </div>
        </div>
      </div>
      <ServiceRequestModal
  isOpen={modalOpenRequest}
  onClose={handleCloseModalRequest}
  onConfirm={handleConfirm} 
  messageTitle={messageTitle}
  messageContent={messageContent}
  type={modalType || "confirm"} 
  filters={modalFilters || ""} // Garantir que filters não seja undefined
  setModalFilters={setModalFilters}
  farmerCrops={farmer?.farmer?.crops || []} // ✅ Correção aqui
  selectedBeekeeper={selectedBeekeeper}
 
/>
<SuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={messageContent}
        title={messageTitle}
      />

    </div>
  );
};

export default DashboardFarmerPage;
