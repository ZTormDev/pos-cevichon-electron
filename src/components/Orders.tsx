import { useState, useEffect } from "react";
import { useNotification } from "./useNotification";
import Swal from "sweetalert2";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { notify } = useNotification();
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadOrders();
  }, []); // El array vacío asegura que useEffect solo se ejecute una vez cuando el componente se monte

  const loadOrders = () => {
    setLoading(true); // Agregar esto para indicar que comienza la carga
    fetch("https://pos-cevichon-backend-production.up.railway.app/api/orders")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.data)) {
          const sortedOrders = data.data.sort(
            (a, b) => b.order_id - a.order_id
          );
          setOrders(sortedOrders);
        } else {
          console.error("Unexpected data format:", data);
        }

        setTimeout(() => {
          setLoading(false);
        }, 1000);
      })
      .catch((err) => {
        console.error("Error loading orders:", err);
        setLoading(false);
      });
  };

  const refreshOrders = () => {
    notify("Refrescando Pedidos..", 1500, "info");
    loadOrders();
  };

  const formatNumber = (number) => {
    const parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(
        `https://pos-cevichon-backend-production.up.railway.app/api/orders/${orderId}`
      );
      const data = await response.json();

      const orderItemsResponse = await fetch(
        `https://pos-cevichon-backend-production.up.railway.app/api/order_items`
      );
      const orderItems = await orderItemsResponse.json();

      setSelectedOrder({
        ...data,
        items: orderItems.data.filter(
          (item) => item.order_id === data.order_id
        ),
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const handleOrderClick = (orderId) => {
    fetchOrderDetails(orderId);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const searchLocation = (client_address) => {
    // CAMBIAR CONCEPCION SI REPARTEN A MAS LUGARES
    window.open(
      "https://www.google.com/maps/search/?api=1&query=Concepcion%20" +
        encodeURIComponent(client_address),
      "_blank"
    );
  };

  const makeCall = (client_number) => {
    window.open(`tel:${client_number}`);
  };

  const formatTime = (date) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return date.toLocaleTimeString([], options);
  };

  const makeSale = (orderId) => {
    const now = new Date();

    fetch("https://pos-cevichon-backend-production.up.railway.app/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order_id: orderId,
        sale_date: now.toISOString().split("T")[0],
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to make a sale");
        }
      })
      .catch((err) => console.error("Error adding product:", err));
  };

  const completePendingOrders = (orderID) => {
    const newStatus = "Completado";

    Swal.fire({
      title: "¿Deseas completar el pedido?",
      text: "No podrás revertir esta acción",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "rgb(68, 180, 255)",
      cancelButtonColor: "rgb(253, 80, 80)",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `https://pos-cevichon-backend-production.up.railway.app/api/orders/${orderID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ order_status: newStatus }),
          }
        )
          .then((response) => {
            if (response.ok) {
              Swal.fire("Listo", "El pedido a sido completado.", "success");
              notify("Pedido completado exitosamente!", 5000, "success");

              closeOrderDetails();
              loadOrders();
              makeSale(orderID);
            } else {
              notify(
                "Error: No se a podido completar el pedido",
                5000,
                "error"
              );
            }
          })
          .catch((err) => console.error("Error adding product:", err));
      }
    });
  };

  const deleteOrder = (orderId) => {
    Swal.fire({
      title: "¿Estás seguro de eliminar el pedido?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(68, 180, 255)",
      cancelButtonColor: "rgb(253, 80, 80)",
      confirmButtonText: "Sí, eliminarlo",
    }).then((result) => {
      if (result.isConfirmed) {
        // Aquí colocas la lógica para eliminar el item
        fetch(
          `https://pos-cevichon-backend-production.up.railway.app/api/orders/${orderId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((response) => {
            if (response.ok) {
              Swal.fire(
                "¡Eliminado!",
                "Tu pedido ha sido eliminado.",
                "success"
              );
              notify("Pedido eliminado con exito!", 5000, "success");

              closeOrderDetails();
              loadOrders();
            } else {
              notify("Error: No se a podido eliminar el pedido", 5000, "error");
            }
          })
          .catch((err) => console.error("Error deleting product:", err));
      }
    });
  };

  if (loading) {
    return (
      <SkeletonTheme
        baseColor="var(--skeleton-card-bg)"
        highlightColor="var(--skeleton-card-highlight)"
        borderRadius={"1rem"}
      >
        <div id="pedidos" className="section">
          <div className="title-pedidos">
            <h2>Pedidos</h2>
            <Skeleton width={"10rem"} height={"3rem"}></Skeleton>
          </div>
          <div className="pedidos-container">
            <li className="pedidos-class-list">
              <p>ID del Pedido</p>
              <p>Nombre Cliente</p>
              <p className="order-address-text">Direccion Cliente</p>
              <p>Fecha</p>
              <p id="total-pedido-text">Total</p>
              <p>Estado</p>
            </li>

            <Skeleton
              height={"4.5rem"}
              style={{ marginBlock: "1rem" }}
            ></Skeleton>
            <Skeleton
              height={"4.5rem"}
              style={{ marginBlock: "1rem" }}
            ></Skeleton>
            <Skeleton
              height={"4.5rem"}
              style={{ marginBlock: "1rem" }}
            ></Skeleton>
          </div>
        </div>
      </SkeletonTheme>
    );
  } else {
    if (!orders.length) {
      return <p className="loading-text">No hay órdenes disponibles.</p>;
    } else {
      return (
        <div id="pedidos" className="section">
          <div className="title-pedidos">
            <h2>Pedidos</h2>
            <button id="refresh-button" onClick={refreshOrders}>
              Refrescar
            </button>
          </div>
          <div className="pedidos-container">
            <li className="pedidos-class-list">
              <p>ID del Pedido</p>
              <p>Nombre Cliente</p>
              <p className="order-address-text">Direccion Cliente</p>
              <p>Fecha</p>
              <p id="total-pedido-text">Total</p>
              <p>Estado</p>
            </li>
            <div className="registro-pedidos-container">
              {orders.map((order) => (
                <li
                  key={order.order_id}
                  onClick={() => handleOrderClick(order.order_id)}
                >
                  <p>{order.order_id}</p>
                  <p>{order.client_name}</p>
                  <p className="order-address-text">{order.client_address}</p>
                  <p>
                    {order.order_time}
                    <br />
                    {order.order_date}
                  </p>
                  <p className="order-total-text">
                    ${formatNumber(order.order_total)}
                  </p>
                  <p id="status-text" className="status-text">
                    {order.order_status}
                    <a
                      id={`dotstatus-${order.order_id}`}
                      className="dotstatus"
                      style={{
                        color:
                          order.order_status.trim() === "Completado"
                            ? "rgb(98, 228, 120)"
                            : "gray",
                      }}
                    >
                      •
                    </a>
                  </p>
                </li>
              ))}
            </div>
            {selectedOrder && (
              <div className="order-details-bg">
                <div className="order-details-container">
                  <div className="details-order-container">
                    <div className="information-order-container">
                      <h2>Detalles del Pedido</h2>
                      <div className="items-client-container">
                        <li>
                          <p>Nombre</p>
                          <p>Cantidad</p>
                          <p>Total</p>
                        </li>
                        {selectedOrder.items.map((item) => (
                          <li key={item.product_name}>
                            <p>{item.product_name}</p>
                            <p>{formatNumber(item.product_quantity)}</p>
                            <p>${formatNumber(item.product_total)}</p>
                          </li>
                        ))}
                      </div>
                      <div className="info-details-order">
                        <div>
                          <p>Total del Pedido: </p>
                          <p>${formatNumber(selectedOrder.order_total)}</p>
                        </div>
                        <div>
                          <p>Nombre del cliente: </p>
                          <p>{selectedOrder.client_name}</p>
                        </div>
                        <div>
                          <p>Numero del cliente: </p>
                          <p>{selectedOrder.client_number}</p>
                        </div>
                        <div>
                          <p>Direccion del cliente: </p>
                          <p>{selectedOrder.client_address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="buttons-order-container">
                      <div className="top-buttons">
                        {selectedOrder.client_address !== "Retiro Local" && (
                          <button
                            id={`map-button-${selectedOrder.order_id}`}
                            className="map-button"
                            onClick={() =>
                              searchLocation(selectedOrder.client_address)
                            }
                          >
                            Ver en el Mapa
                          </button>
                        )}
                        <button
                          id="make-call-button"
                          onClick={() => makeCall(selectedOrder.client_number)}
                        >
                          Llamar
                        </button>
                      </div>

                      <div className="bottom-buttons">
                        {selectedOrder.order_status !== "Completado" && (
                          <>
                            <button
                              id="complete-order-button"
                              onClick={() =>
                                completePendingOrders(selectedOrder.order_id)
                              }
                            >
                              Pedido Completado
                            </button>
                            <button
                              id="delete-order-button"
                              onClick={() =>
                                deleteOrder(selectedOrder.order_id)
                              }
                            >
                              Borrar Pedido
                            </button>
                          </>
                        )}
                      </div>
                      <button
                        id="close-orderdetails-button"
                        onClick={closeOrderDetails}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

export default Orders;
