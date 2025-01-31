import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNotification } from "./useNotification";
import Swal from "sweetalert2";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import PasswordInput from "./PasswordInput";

const ManageUsersPanel = ({ setMUPVisible }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const token = localStorage.getItem("token");
  const [users, setUsers] = useState([]);
  const { notify } = useNotification();
  const [userFormVisible, setUserFormVisible] = useState(false);
  const [passwordFormVisible, setPasswordFormVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const decodedToken = jwtDecode(localStorage.getItem("token"));
  const userId = decodedToken.userId;

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleClose = () => {
    setFadeOut(true); // Activa la animación de fade-out
    setTimeout(() => {
      setMUPVisible(false); // Cambia la visibilidad después de la animación
    }, 300); // Tiempo que coincide con la duración de la animación en CSS
  };

  const fetchUsers = async () => {
    try {
      if (!token) {
        throw new Error("No se encontró un token válido");
      }

      const response = await axios.get(
        "https://pos-cevichon-backend-production.up.railway.app/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`, // Incluye el token
            "Content-Type": "application/json", // Agrega el encabezado de tipo de contenido
          },
        }
      );

      setUsers(response.data.data);
    } catch (error) {
      console.error("Error al conseguir los usuarios:", error);
    }
  };

  const changeUserPassword = async (user_id, newPassword) => {
    try {
      if (!token) {
        throw new Error("No se encontró un token válido");
      }

      await axios.put(
        `https://pos-cevichon-backend-production.up.railway.app/api/users/reset-password/${user_id}`,
        { newPassword }, // Cambiado a newPassword con P mayúscula
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
    }
  };

  const deleteUser = async (user_id) => {
    Swal.fire({
      title: "¿Estas seguro?",
      text: `¡Se borrara el usuario permanentemente!"`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(68, 180, 255)",
      cancelButtonColor: "rgb(253, 80, 80)",
      confirmButtonText: "Sí, borrar usuario",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (!token) {
            throw new Error("No se encontró un token válido");
          }

          await axios.delete(
            `https://pos-cevichon-backend-production.up.railway.app/api/users/${user_id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          fetchUsers();
          Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");

          if (user_id == userId) {
            localStorage.clear();
            location.reload();
          }
        } catch (error) {
          Swal.fire(
            "Error",
            "Hubo un error al eliminar el usuario: " +
              (error.response?.data?.error || error.message),
            "error"
          );
        }
      }
    });
  };

  const createUser = async (event) => {
    event.preventDefault();

    const username = document
      .getElementById("user-username")
      .value.toLowerCase()
      .replace(/\s+/g, "");
    const password = document
      .getElementById("user-password")
      .value.replace(/\s+/g, "");
    const usertype = document
      .getElementById("user-usertype")
      .value.toLowerCase()
      .replace(/\s+/g, "");

    if (!username || !password || !usertype) {
      Swal.fire("Error", "Por favor, completa todos los campos.", "error");
      return;
    }

    Swal.fire({
      title: "¿Estas seguro?",
      text: `Se creara el usuario "${username}" con los permisos de "${usertype}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "rgb(68, 180, 255)",
      cancelButtonColor: "rgb(253, 80, 80)",
      confirmButtonText: "Sí, crear usuario",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (!token) {
            throw new Error("No se encontró un token válido");
          }

          await axios.post(
            "https://pos-cevichon-backend-production.up.railway.app/api/users",
            { username, password, usertype },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          Swal.fire(
            "¡Éxito!",
            "El usuario ha sido creado exitosamente.",
            "success"
          );
          toggleUserForm();
          fetchUsers();
        } catch (error) {
          Swal.fire(
            "Error",
            "Hubo un error al crear el usuario: " +
              (error.response?.data?.error || error.message),
            "error"
          );
        }
      }
    });
  };

  const toggleUserForm = () => {
    setUserFormVisible(!userFormVisible);
  };

  const togglePasswordForm = () => {
    setPasswordFormVisible(!passwordFormVisible);
  };

  const UserForm = () => {
    return (
      <div
        className={`user-form-container panel-card ${
          fadeOut ? "scale-out" : ""
        }`}
      >
        <div id="user-form">
          <h3>Crear usuario</h3>
          <form onSubmit={createUser}>
            <input
              type="text"
              id="user-username"
              placeholder="Nombre de usuario"
              required
              onChange={handleInputUsername}
            />
            <PasswordInput
              id="user-password"
              placeholder="Contraseña"
              required
              onChange={handleInputPassword}
            />
            <div className="user-usertype-container">
              <label htmlFor="user-usertype">Tipo de usuario:</label>
              <div className="select">
                <select id="user-usertype" name="User Type" required>
                  <option value="admin">Admin</option>
                  <option value="caja">Caja</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
            </div>
            <button id="create-button" type="submit">
              Crear
            </button>
          </form>
        </div>
        <button onClick={toggleUserForm} className="user-form-close">
          Volver
        </button>
      </div>
    );
  };

  const PasswordForm = () => {
    const handleSubmit = async (event) => {
      event.preventDefault();
      const newPassword = document.getElementById("user-newpassword").value;

      Swal.fire({
        title: "¿Estas seguro?",
        text: `Se cambiara la contraseña del usuario por "${newPassword}"`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "rgb(68, 180, 255)",
        cancelButtonColor: "rgb(253, 80, 80)",
        confirmButtonText: "Sí, cambiar contraseña",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await changeUserPassword(selectedUserId, newPassword);
            togglePasswordForm();
            if (selectedUserId == userId) {
              localStorage.clear();
              location.reload();
            }
            Swal.fire(
              "¡Listo!",
              "La contraseña ha sido cambiada exitosamente.",
              "success"
            );
          } catch (error) {
            Swal.fire(
              "Error",
              "Hubo un error al cambiar la contraseña: " +
                (error.response?.data?.error || error.message),
              "error"
            );
          }
        }
      });
    };

    return (
      <div
        className={`user-form-container panel-card ${
          fadeOut ? "scale-out" : ""
        }`}
      >
        <div id="user-form">
          <h3>Cambiar Contraseña</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              id="user-newpassword"
              placeholder="Nueva Contraseña"
              required
              onChange={handleInputPassword}
            />
            <button id="create-button" type="submit">
              Cambiar Contraseña
            </button>
          </form>
        </div>
        <button onClick={togglePasswordForm} className="user-form-close">
          Volver
        </button>
      </div>
    );
  };

  const handleInputUsername = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, "");
    e.target.value = value;
  };
  const handleInputPassword = (e) => {
    const value = e.target.value.replace(/\s+/g, "");
    e.target.value = value;
  };

  return (
    <div className={`manage-users-panel panel ${fadeOut ? "fade-out" : ""}`}>
      {!userFormVisible ? (
        !passwordFormVisible ? (
          <div className={`panel-card ${fadeOut ? "scale-out" : ""}`}>
            <h3 className="panel-title">Gestionar Usuarios</h3>
            <button onClick={handleClose} className="panel-close-button">
              <span className="material-symbols-rounded">close</span>
            </button>
            {users ? (
              <>
                <div className="panel-content">
                  <div className="permissons">
                    <p className="permisson-title">Permisos: </p>
                    <div className="permisson-details">
                      <p>
                        <b>Admin</b>: Tiene todos los permisos posibles.
                      </p>
                      <p>
                        <b>Caja</b>: Solo tiene los permisos para ver la caja.
                      </p>
                      <p>
                        <b>Delivery</b>: Solo tiene los permisos para ver los
                        pedidos.
                      </p>
                    </div>
                  </div>
                  <div className="panel-users-container">
                    {users.map((user) => (
                      <li
                        key={user.user_id}
                        id={`user-li-${user.user_id}`}
                        className={`user-li ${
                          user.user_id == userId && "current-user"
                        }`}
                      >
                        <div className="user-info">
                          <p>ID: {user.user_id}</p>
                          <p>Usuario: {user.username}</p>
                          <p>Permisos: {user.user_type}</p>
                          {user.user_id == userId && (
                            <p className="current-p">(En uso)</p>
                          )}
                        </div>
                        <div className="user-buttons">
                          <button
                            onClick={() => {
                              setSelectedUserId(user.user_id);
                              togglePasswordForm();
                            }}
                            id="reset-password"
                          >
                            Cambiar Contraseña
                          </button>
                          <button
                            onClick={() => deleteUser(user.user_id)}
                            id="delete-user"
                          >
                            Borrar usuario
                          </button>
                        </div>
                      </li>
                    ))}
                  </div>
                  <button onClick={toggleUserForm} id="add-user">
                    Crear Usuario
                  </button>
                </div>
                <p className="unavaible-content">
                  Seccion no disponible en telefonos, porfavor utilize un pc o
                  tablet.
                </p>
              </>
            ) : (
              <p>loading</p>
            )}
          </div>
        ) : (
          <PasswordForm></PasswordForm>
        )
      ) : (
        <UserForm></UserForm>
      )}
    </div>
  );
};

export default ManageUsersPanel;
