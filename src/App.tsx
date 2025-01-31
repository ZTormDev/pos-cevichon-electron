import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import "./index.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Products from "./components/Products";
import Sales from "./components/Sales";
import Orders from "./components/Orders";
import Atm from "./components/Atm";
import Notification from "./components/Notification.tsx";
import axios from "axios";
import cevichonLogo from "./assets/cevichon logo.webp";
import bgOverlay from "./assets/Simple Shiny.svg";
import wave1 from "./assets/wave.png";
import wave2 from "./assets/wave (1).png";
import { ThreeDots } from "react-loader-spinner";

function App() {
  const [view, setView] = useState("products"); // Estado para controlar la vista actual
  const [token, setToken] = useState("");
  const [userType, setUserType] = useState(""); // Nuevo estado para almacenar el tipo de usuario
  const [loginError, setLoginError] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false); // Estado para controlar la visibilidad de la contraseña

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.style.backgroundColor = "rgb(68, 180, 255)";
  }, []);

  useEffect(() => {
    // Verificar token inicial
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode(storedToken);
        const currentTime = Math.floor(Date.now() / 1000);
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem("token");
          setToken("");
        } else {
          setToken(storedToken);
          setUserType(decodedToken.userType);
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
        localStorage.removeItem("token");
        setToken("");
      }
    }

    // Configurar intervalo de verificación
    const checkTokenExpiration = setInterval(() => {
      const currentToken = localStorage.getItem("token");
      if (currentToken) {
        try {
          const decodedToken = jwtDecode(currentToken);
          const currentTime = Math.floor(Date.now() / 1000);

          if (decodedToken.exp < currentTime) {
            console.log("Token expirado");
            localStorage.removeItem("token");
            setToken("");
          }
          // Solo logueamos el tiempo restante sin actualizar estados si no ha expirado
          else {
            //console.log("TOKEN VALIDO POR: " + (decodedToken.exp - currentTime));
          }
        } catch (error) {
          console.error("Error al decodificar el token:", error);
          localStorage.removeItem("token");
          setToken("");
        }
      }
    }, 1000);

    return () => clearInterval(checkTokenExpiration);
  }, []); // Removido token de las dependencias

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const login = async (event) => {
    event.preventDefault();
    const inputUsername = document
      .getElementById("username-input")
      .value.toLowerCase();
    const inputPassword = document.getElementById("password-input").value;
    const loginFormContainer = document.querySelector(".form-container-login");
    const loadingIconContainer = document.querySelector(
      ".loading-icon-form-login"
    );
    const loginForm = document.querySelector("#login-section form");

    const originalHeight = loginForm.style.height;

    loginForm.style.height = "10rem";

    loginFormContainer.classList.add("hidden");
    loadingIconContainer.classList.remove("hidden");

    try {
      const response = await axios.post(
        "https://pos-cevichon-backend-production.up.railway.app/login",
        {
          username: inputUsername,
          password: inputPassword,
        }
      );

      const { token: tokenResponse } = response.data;
      setToken(tokenResponse);
      localStorage.setItem("token", tokenResponse);

      const decodedToken = jwtDecode(tokenResponse);
      setUserType(decodedToken.userType);

      const root = document.getElementById("root");
      if (root) root.style.backgroundColor = "#f1f3f4";

      setLoginError(false);
    } catch {
      loginForm.style.height = originalHeight;
      loginFormContainer.classList.remove("hidden");
      loadingIconContainer.classList.add("hidden");
      setLoginError(true);
    }
  };

  const renderView = () => {
    if (userType === "delivery") {
      return <Orders />;
    }
    if (userType === "caja") {
      return <Atm />;
    }

    switch (view) {
      case "products":
        return <Products />;
      case "sales":
        return <Sales />;
      case "orders":
        return <Orders />;
      case "atm":
        return <Atm />;
      default:
        return <Products />;
    }
  };

  if (token) {
    return (
      <>
        <img className="bg-overlay" src={bgOverlay} alt="" />
        <div className="area">
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
        <Header />
        <div className="main-content">
          {userType !== "delivery" && userType !== "caja" && (
            <Sidebar onViewChange={setView} />
          )}
          {renderView()}
        </div>
        <Notification />
      </>
    );
  } else {
    return (
      <div id="login-section" className="section">
        <img className="bg-overlay-login" src={bgOverlay} alt="" />
        <img className="wave1" src={wave1} alt="" />
        <img className="wave2" src={wave2} alt="" />
        <img className="logo-img login" src={cevichonLogo} alt="" />
        <form onSubmit={login}>
          <div className="form-container-login">
            <h2>Inicia Sesion</h2>
            <div className="input-container">
              <p>Nombre de usuario:</p>
              <input
                id="username-input"
                type="text"
                placeholder="Nombre de usuario.."
                autoComplete="username"
              />

              <p>Contraseña:</p>
              <div className="password-container">
                <input
                  id="password-input"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Contraseña.."
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="material-symbols-rounded"
                  id="toggle-password-btn"
                >
                  {passwordVisible ? "visibility" : "visibility_off"}
                </button>
              </div>

              {loginError && (
                <p className="error-txt">
                  Error: Usuario o Contraseña incorrectos
                </p>
              )}
              <input
                type="submit"
                style={{ position: "absolute", left: "-9999px" }}
              />
            </div>
            <button id="login-button">Iniciar Sesion</button>
          </div>
          <div className="loading-icon-form-login hidden">
            <ThreeDots
              visible={true}
              height="100"
              width="100"
              color="rgb(68, 180, 255)"
              radius="9"
              ariaLabel="three-dots-loading"
              wrapperStyle={{}}
              wrapperClass=""
            ></ThreeDots>
          </div>
        </form>
      </div>
    );
  }
}

export default App;
