import { useState } from "react";
import ThemeButton from "./ThemeButton";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";
import ManageUsersPanel from "./ManageUsersPanel";
import cevichonLogo from "../assets/shark logo.webp";

const Header = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [MUPVisible, setMUPVisible] = useState(false);
  const decodedToken = jwtDecode(localStorage.getItem("token"));
  const username = decodedToken.userName;
  const userType = decodedToken.userType;

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const toggleMUP = () => {
    setMUPVisible(!MUPVisible);
    toggleMenu();
  };

  function logout() {
    toggleMenu();
    Swal.fire({
      title: "¿Deseas cerrar la sesion actual?",
      text: "Esta acción cerrará tu sesión actual y te llevará a la pantalla de inicio de sesión.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(68, 180, 255)",
      cancelButtonColor: "rgb(253, 80, 80)",
      confirmButtonText: "Sí, Cerrar sesion",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  const UserMenu = () => {
    return (
      <div className={`user-menu scale-in`}>
        {userType == "admin" && (
          <>
            <button onClick={toggleMUP}>
              Gestionar Usuarios
              <span className="material-symbols-rounded">person_edit</span>
            </button>
            <button>
              Configuracion
              <span className="material-symbols-rounded">settings</span>
            </button>
          </>
        )}
        <button id="close-sesion-button" onClick={logout}>
          Cerrar Sesion <span className="material-symbols-rounded">logout</span>
        </button>
      </div>
    );
  };

  return (
    <header>
      <div className="nav">
        <div className="nav-title">
          <h1>POS-CEVICHON</h1>
          <ThemeButton />
        </div>
        <div className="user-container">
          <div className="user-details">
            <button id="user-button" onClick={toggleMenu}>
              <p id="username-text">{username}</p>
              <p className="user-icon material-symbols-rounded">
                account_circle
              </p>
            </button>
          </div>
          {menuVisible && <UserMenu></UserMenu>}
        </div>
      </div>

      {MUPVisible && <ManageUsersPanel setMUPVisible={setMUPVisible} />}
    </header>
  );
};

export default Header;
