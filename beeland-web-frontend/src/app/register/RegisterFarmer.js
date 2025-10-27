import React, { useState } from "react";
import axios from "axios";
import Agricultor from "../assets/_beeland_agricultor.png"; // Import image asset
import Logo from "../assets/logo.png"; // Import image asset
import RegistrationMap from "./RegistrationMap"; // Import the map component for consistency
import "./RegisterFarmer.css"; // Import the custom CSS
import { URL } from "../../config";
import SuccessModal from "../Modal/SucessModal";
import { useHistory } from "react-router-dom";




const FarmerRegistration = ({ onUserRegister , onRegister }) => {
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
    farmArea: 0,
    crops: [
      { cropType: "", cropArea: 0 }, // Adiciona um item vazio na inicialização
    ],
  
    lat: 0,
    long: 0,
    region: "",
    country: "",
    district: "",
    account_status:false,
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
 

  /*const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };*/

  const getCoordinatesFromAddress = async (address) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          long: parseFloat(data[0].lon),
        };
      } else {
        console.error("Endereço não encontrado!");
        return { lat: "", long: "" };
      }
    } catch (error) {
      console.error("Erro ao obter coordenadas:", error);
      return { lat: "", long: "" };
    }
  };

  let timeoutId;
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "address") {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        const coordinates = await getCoordinatesFromAddress(value);
        setFormData((prevData) => ({
          ...prevData,
          lat: coordinates.lat,
          long: coordinates.long,
        }));
      }, 1000);
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
      region: value.region,
      country: value.country,
      district: value.distrito,
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
  

  const handleSubmit = (e) => {
    e.preventDefault();

    const preparedFormData = {
      ...formData,
      lat: isNaN(formData.lat) || formData.lat === "" ? 0 : formData.lat,
      long: isNaN(formData.long) || formData.long === "" ? 0 : formData.long,
    };

    axios
      .post(`${URL}/beeland-api/user/register/farmer`, formData)
      .then((response) => {
        console.log("Farmer registered successfully:", response.data);
        setIsSuccessModalOpen(true);

      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          setErrorMessage(error.response.data.message);
        } else {
          setErrorMessage("Erro interno do servidor. Tente novamente mais tarde. Para assistência, contacte: beeland.dop2023@gmail.com");
        }
      });
      
  };
  const handleAddCrop = () => {
    setFormData({
      ...formData,
      crops: [...formData.crops, { cropType: "", cropArea: 0 }],
    });
  };
  
  const handleCropChange = (index, field, value) => {
    const updatedCrops = [...formData.crops];
    updatedCrops[index][field] = value;
    setFormData({ ...formData, crops: updatedCrops });
  };
  
  const handleRemoveCrop = (index) => {
    const updatedCrops = formData.crops.filter((_, i) => i !== index);
    setFormData({ ...formData, crops: updatedCrops });
  };

  return (
    <div className="content-layout">
      <img
        className="register-logo"
        style={{ cursor: "pointer" }}
        src={Logo}
        alt="logo"
        width={250}
        onClick={() => onUserRegister("")}
      />
      <div className="header-title">
        <span>
          <p style={{ textAlign: "left" }}>Bolsa de Polinização Apícola</p>
        </span>
      </div>
      <span className="register-title">Registo do Agricultor</span>
      Por favor, preencha o formulário de registo
      <div className="move-effect register-form-wrapper">
        <div className="move-effect-one left-column">
          <img src={Agricultor} alt="Agricultor" />
          <div className="title">AGRICULTOR</div>
          <div className="subtitle">(registo)</div>
          <div
            className="regressar"
            style={{ marginTop: "2rem" }}
            onClick={() => onUserRegister("")}
          >
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
              <div className="form-subgroup item">
                <input
                  style={{ textAlign: "left" }}
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="Cod. Postal"
                  required
                />
                <input
                  style={{
                    width: "90%",
                    textAlign: "left",
                    marginLeft: "1rem",
                  }}
                  type="text"
                  name="locality"
                  value={formData.locality}
                  onChange={handleChange}
                  placeholder="Localidade"
                  required
                />
              </div>
            </div>

            <div className="move-effect input-group-right">
              <div className="form-map-container">
                <RegistrationMap
                  range={formData.farmArea}
                  onUserInfoChange={handleAddressChange}
                />
                </div>
                <div className="form-subgroup">
                <div className="form-subgroup item" >
  {/* Texto alinhado à esquerda */}
  <label style={{ margin: "0" }}>Todas as culturas:</label>
  
  {/* Espaço no meio */}
  <div style={{ flex: 10 }}></div>

  {/* Botão alinhado à direita */}
  <button type="" onClick={handleAddCrop} style={{ marginLeft: "auto" }}>
    Adicionar
  </button>
</div>
{formData.crops.map((crop, index) => (
  <div key={index} className="crop-item">
    {/* Campo de seleção de Tipo de Cultura */}
    <select
      value={crop.cropType}
      onChange={(e) =>
        handleCropChange(index, "cropType", e.target.value)
      }
      required
    >
      <option value="" disabled>
        Tipo de Cultura
      </option>
      <option value="Abacate">Abacate</option>
      <option value="Abóbora">Abóbora</option>
      <option value="Amendoa - Auto incompatíveis">
        Amendoa - Auto incompatíveis
      </option>
      <option value="Amendoa auto férteis">
        Amendoa auto férteis
      </option>
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

    {/* Campo de Área da Cultura */}
    <input
    className="TypeArea"
  type="text" // Alterado para "text" para aceitar o placeholder com texto descritivo
  placeholder="Área da Cultura (Ha)"
  value={crop.cropArea || ""} // Exibe o valor inserido ou mantém vazio
  onChange={(e) => {
    const value = e.target.value.replace(",", "."); // Substitui vírgulas por pontos, se necessário
    if (!isNaN(value) && (value === "" || parseFloat(value) >= 0)) { 
      handleCropChange(index, "cropArea", value); // Atualiza apenas com números válidos ou vazio
    }
  }}
  required
/>


    {/* Botão para remover a cultura */}
    <button type="button" className="remover" onClick={() => handleRemoveCrop(index)}>
      Remover
    </button>
  </div>
))}


 
  
</div>

<button 
  type="sub" 
  style={{
  
    
    
    height: "-1%", // Define uma altura específica
   
  }}
>
  Registar
</button>
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

export default FarmerRegistration;
