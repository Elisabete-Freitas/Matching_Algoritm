import React, { useState } from "react";
import axios from "axios";
import Apicultor from "../assets/_beeland_apicultor.png";
import Logo from "../assets/logo.png";
import RegistrationMap from "./RegistrationMap";
import "./Register.css";
import { URL } from "../../config";
import SuccessModal from "../Modal/SucessModal";
import { useHistory } from "react-router-dom";


const BeekeeperRegistration = ({ onUserRegister , onRegister}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    lastname: "",
    nif: "",
    phone: "",
    address: "",
    postalCode: "",
    locality: "",
    serviceArea: 50000,
    hiveCount: 0,
    serviceRate: 0,
    lat: 0,
    long: 0,
   // region: "",
   // country: "",
    //district: "",
    account_status:false,
    experience: 0,
  travel_price: 0,
  species: [{ Type: "" }],
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
    // Se o campo alterado for 'address', faz a busca das coordenadas
    if (name === "address" && value.length > 5) {  // Garantir que a morada não seja muito curta
      geocodeAddress(value);
    }
  };
  

  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
        },
      });
  
      if (response.data.length > 0) {
        const location = response.data[0];
        setFormData((prevData) => ({
          ...prevData,
          lat: parseFloat(location.lat),
          long: parseFloat(location.lon),
          //region: location.address.state || "",
         // country: location.address.country || "",
         // district: location.address.county || "",
        }));
        console.log("Coordenadas atualizadas:", location.lat, location.lon);
      } else {
        console.error("Nenhuma localização encontrada para o endereço fornecido.");
      }
    } catch (error) {
      console.error("Erro ao buscar coordenadas:", error);
    }
  };
  


  const handleAddressChange = (value) => {
    setFormData({
      ...formData,
      address: value.street,
      postalCode: value.postalCode,
      locality: value.city,
      lat: value.lat,
      long: value.long,
     // region: value.region,
     // country: value.country,
     // district: value.distrito
    });
    console.log("Address changed to: ", value);
  };
  const history = useHistory();

  const handleCloseModal = () => {
    //console.log("onRegister prop:", onRegister);
    setIsSuccessModalOpen(false);
    if (typeof onRegister === "function") {
      onRegister();
    } else {
      console.error("onRegister não é uma função");
    }
  };
   const handleAddSpecies = () => {
  setFormData((prevData) => ({
    ...prevData,
    species: [...prevData.species, { Type: "" }],
  }));
};

const handleSpeciesChange = (index, value) => {
  const updatedSpecies = [...formData.species];
  updatedSpecies[index].Type = value;
  setFormData({ ...formData, species: updatedSpecies });
};

const handleRemoveSpecies = (index) => {
  const updatedSpecies = formData.species.filter((_, i) => i !== index);
  setFormData({ ...formData, species: updatedSpecies });
};

  const handleSubmit = (e) => {
    e.preventDefault();
    // Post data to the server

    const preparedFormData = {
      ...formData,
      lat: isNaN(formData.lat) || formData.lat === "" ? 0 : formData.lat,
      long: isNaN(formData.long) || formData.long === "" ? 0 : formData.long,
    };


    axios
      .post(`${URL}/beeland-api/user/register/beekeeper`, formData)
      .then((response) => {
        console.log("Beekeeper registered successfully:", response.data);
        setIsSuccessModalOpen(true);
      })
      .catch((error) => {
        console.error("Erro ao Registar o Apicultor!", error);
        console.log("dados  enviados:", formData);
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Erro interno do servidor. Tente novamente mais tarde. Para assistência, contacte: beeland.dop2023@gmail.com");
        }
      });
  };

  return (
    <div className="content-layout">
      <img className="register-logo" style={{cursor:"pointer"}} src={Logo} alt="logo" width={250} onClick={() => onUserRegister("")} />
      <div className="header-title">
        <span>
       
          <p style={{ textAlign: "left" }}>Bolsa de Polinização Apícola</p>
        </span>
      </div>
      <span className="register-title">Registo do Apicultor</span>
      Por favor, preencha o formulário de registo
      <div className="move-effect register-form-wrapper">
        <div className="move-effect-one left-column">
          <img src={Apicultor} alt="Apicultor" />
          <div className="title">APICULTOR</div>
          <div className="subtitle">(registo)</div>
          <div className="regressar" style={{marginTop:"2rem"}} onClick={() => onUserRegister("")}>
            Regressar
          </div>
        </div>
        <div className="right-column">
        {errorMessage && (
  <div className="error-message" style={{ color: "red", marginBottom: "1rem" }}>
    {errorMessage}
  </div>
)}

          <form onSubmit={handleSubmit}>
            <div className="move-effect-one input-group-left">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome"
                required
              />
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                placeholder="Apelido"
                required
              />
              <input
                type="text"
                name="nif"
                value={formData.nif}
                onChange={handleChange}
                placeholder="NIF"
                required
              />
               <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Telemóvel"
                required
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Morada"
                required
              />
               

              <input
               style={{textAlign:"left"}}
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Cod. Postal"
                required
                />
              <input
              style={{width: "100%", textAlign:"left"}}
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder="Localidade"
                required
                />
                </div>
         

            <div className="move-effect input-group-right">
              <div className="form-map-container"> 
              <RegistrationMap range={formData.serviceArea} onUserInfoChange={handleAddressChange} />
              </div>
              <div className="form-subgroup">
              <div className="form-subgroup item" >

              <label>Distância do serviço a prestar:</label>
              <input
                type="range"
                name="serviceArea"
                //defaultValue={formData.serviceArea}
                min="10000"
                step={10000}
                max="150000"
                value={formData.serviceArea}
                onChange={handleChange}
                />
                <span>{parseInt(formData.serviceArea/1000)}Km</span>
              
                </div>
                <div className="form-subgroup item">
              <label>N.º de colmeias (uni):</label>
              <input
                type="number"
                name="hiveCount"
                min={1}
                value={formData.hiveCount}
                onChange={handleChange}
                />
                </div>
                <div className="form-subgroup item">
              <label>Valor mensal do serviço por colmeia solicitada (€):</label>
              <input
                type="number"
                name="serviceRate"
                min={0}
                value={formData.serviceRate}
                onChange={handleChange}
                />
                </div>
                </div>
<div className="form-subgroup item">
  <label>Experiência (anos):</label>
  <input
    type="number"
    name="experience"
    min={0}
    value={formData.experience}
    onChange={handleChange}
    required
  />
</div>

<div className="form-subgroup item">
  <label>Preço de deslocação por Km (€):</label>
  <input
    type="number"
    name="travel_price"
    min={0}
    step={0.01}
    value={formData.travel_price}
    onChange={handleChange}
    required
  />
</div>
<div className="form-subgroup item" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
  <label>Espécies de cultura polinizadas:</label>

  {/* Botão adicionar alinhado à direita */}
  <div style={{ display: "flex", justifyContent: "flex-end" }}>
    <button
      type="button"
      className="remover"
      onClick={handleAddSpecies}
    >
      Adicionar
    </button>
  </div>

  {/* Lista de espécies */}
  {formData.species.map((specie, index) => (
    <div
      key={index}
      className="crop-item"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "0.5rem",
      }}
    >
      <select
        value={specie.Type}
        onChange={(e) => handleSpeciesChange(index, e.target.value)}
        required
      >
        <option value="" disabled>Tipo de Cultura</option>
        <option value="Todas">Todas</option>
        <option value="Abacate">Abacate</option>
        <option value="Abóbora">Abóbora</option>
        <option value="Amendoa - Auto incompatíveis">Amendoa - Auto incompatíveis</option>
        <option value="Amendoa auto férteis">Amendoa auto férteis</option>
        <option value="Framboesa">Framboesa</option>
        <option value="Castanha">Castanha</option>
        <option value="Cebola">Cebola</option>
        <option value="Cenoura">Cenoura</option>
        <option value="Cerejeira">Cerejeira</option>
        <option value="Girassol">Girassol</option>
        <option value="Kiwi">Kiwi</option>
        <option value="Maça">Maça</option>
        <option value="Melão">Melão</option>
        <option value="Mirtilo">Mirtilo</option>
        <option value="Morango">Morango</option>
        <option value="Pera">Pera</option>
        <option value="Pessego">Pessego</option>
        <option value="Laranja/Limão">Laranja/Limão</option>
      </select>

      <button
        type="button"
        className="remover"
        onClick={() => handleRemoveSpecies(index)}
      >
        Remover
      </button>
    </div>
  ))}
</div>


              <button type="submit">Registar</button>
            </div>


          </form>
        </div>
      </div>
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Registo com sucesso!"
  message={
    <>
      A sua conta foi criada com sucesso. <br />
      Faça login na Bolsa de Polinização! <br />  
        
      Obrigado!
    </>
  }
      />
    </div>
  );
};

export default BeekeeperRegistration;
