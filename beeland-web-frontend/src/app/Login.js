import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import Logo from "./assets/logo2.png"
import "./Login.css";
import { URL } from '../config';
import { useHistory } from "react-router-dom";
import { AuthContext } from './auth/AuthContext';
import LogoFunding from "./assets/funding-logo.png";


const Login = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useContext(AuthContext);
  const history = useHistory();

  localStorage.clear();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const url = `${URL}/beeland-api/authentication/login`;
      const response = await axios.post(
        url, 
        { email, password },
        {
          headers: { 'Accept-Charset': 'utf-8' } // Aqui adicionamos os headers
        }
      );

      if (response.status === 200 && response.data.message) {
        const userData = response.data.userData;

     

      // Verificar se o campo "active" é falso
      if (userData.account_status===false) {
        setError('A sua conta não está ativa. Por favor, contacte o suporte.');
       
        return;
      }
        
        localStorage.setItem("user", JSON.stringify(userData)); // salva corretamente
loginUser(userData);
onLogin(true);

       // history.push('/dashboard'); // Redirect to the dashboard or another appropriate route
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error(error);
      // Verifica o código de status da resposta e exibe a mensagem apropriada
  let errorMsg = 'Ocorreu um erro ao tentar iniciar sessão. Tente novamente.';
  if (error.response) {
    if (error.response.status === 404) {
      errorMsg = 'O utilizador não foi encontrado. Verifique o email e tente novamente.';
    } else if (error.response.status === 403) {
      errorMsg = 'A sua conta não esta ativa. Por favor, contacte o suporte.';
    } else if (error.response.status === 401) {
      errorMsg = 'A palavra-passe esta incorreta. Tente novamente.';
    }
  }

  // Se a mensagem do backend tiver caracteres especiais ou encoding incorreto, pode ser necessário corrigi-los
  //const sanitizedErrorMsg = errorMsg.replace(/[^\x00-\x7F]/g, ''); // Remove caracteres não-ASCII, caso necessário

 // console.log(sanitizedErrorMsg, error.response?.data);
  setError(errorMsg);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center login-page">
        <div className="header-title">
          <span>
            {" "}
            <p>Bolsa de Polinização Apícola</p>
          </span>
        </div>
        <div className="move-effect login-card-wrapper">
          <img
            src={Logo}
            alt="Logo"
            width={190}
            style={{ marginBottom: "1rem" }}
          />
          <div
            style={{
              background: "none",
              borderRadius: "0rem 0rem 0.9rem 0.9rem",
            }}
          >
            <Form className="login-form-wrapper" onSubmit={handleLogin}>
              <Form.Group
                className="login-form-item-wrapper"
                controlId="email"
              >
                <Form.Control
                  className="login-input-item-wrapper"
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  style={{ borderRadius: "0.5rem", fontSize: "small" }}
                  required
                />
              </Form.Group>
              <Form.Group
                className="login-form-item-wrapper"
                controlId="password"
              >
                <Form.Control
                  className="login-input-item-wrapper"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  style={{ borderRadius: "0.5rem", fontSize: "small" }}
                  required
                />
              </Form.Group>
              <Form.Group
                style={{
                  height: "1.5rem",
                  display: "block",
                  marginTop: "1rem",
                }}
              >
                <div
                  className="error-wrapper"
                  style={{ display: error ? "" : "none" }}
                >
                  {error}
                </div>
              </Form.Group>
              <Form.Group className="login-form-item-wrapper">
                <button type="submit" className="login-button-btn">
                  Entrar
                </button>
              </Form.Group>
            </Form>
          </div>
        </div>
        <span style={{  color: "var(--text-color)", marginTop: "2rem" }}>
        Ainda não tem conta?
          </span>
        <span  style={{ color: "var(--focus-color)" , textDecoration: "underline",     cursor: "pointer" 
}} onClick={() => onRegister(true)}>
            Registar
          </span>

        <div className="footer-developer">
       
          &copy;2024 -{" "}
          <span style={{ textDecoration: "none", color: "var(--text-color)" }}>
            developed by{" "}
          </span>
          <b>MORECOLAB</b> 
          <a
            href="http://www.morecolab.pt"
            style={{ textDecoration: "none", color: "var(--text-color)" }}
          >
            
          </a>
        </div>
        <div className="footer-funding">
         <img class="funding" src={LogoFunding} width={1050} style={{
                      paddingRight:20}
                    } /></div>
      </div>
    </>
  );
};

export default Login;
