import { useState, useEffect, useMemo } from "react";
import { useNotification } from "./useNotification";
import Swal from "sweetalert2";

const Atm: React.FC = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const { notify } = useNotification();
  const token = localStorage.getItem("token");
  const [printersList, setPrintersList] = useState([]);
  const [sharedPrinterName, setSharedPrinterName] = useState(undefined);

  const [includeIva, setIncludeIva] = useState(true);

  const ipcRenderer = (window as any).ipcRenderer;

  useEffect(() => {
    console.log("Shared printer name:", sharedPrinterName);
  }, [sharedPrinterName]);

  const getPrintersList = async () => {
    try {
      const printers = await ipcRenderer.invoke("get-printers");
      setPrintersList(printers);

      if (printers.length > 0) {
        setSharedPrinterName(printers[0]); // Set first printer as default
      }
    } catch (error) {
      console.error("Error getting printers:", error);
    }
  };

  // Add refresh handler
  const handleRefreshPrinters = () => {
    getPrintersList();
  };

  useEffect(() => {
    getPrintersList();
  }, []);

  const printersListOptions = useMemo(
    () =>
      printersList.map((item, i) => (
        <option key={`option-${i}-${item}`} value={item} title={item}>
          {item.length > 10 ? `${item.substring(0, 15)}...` : item}
        </option>
      )),
    [printersList]
  );

  useEffect(() => {
    if (isActive) {
      fetch(
        "https://pos-cevichon-backend-production.up.railway.app/api/products"
      )
        .then((response) => response.json())
        .then((data) => {
          setProducts(data.data);
        })
        .catch((err) => console.error("Error loading products:", err));
    } else {
      setProducts([]);
    }
  }, [isActive]);

  useEffect(() => {
    calculateTotal();
  }, [cart, discount, includeIva]);

  const handleAddProduct = () => {
    setIsActive(!isActive);
  };

  const formatNumber = (number) => {
    const parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
  };

  const deformatNumber = (number) => {
    const parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "");
    return parts.join("");
  };

  const actualizarCantidad = (productId, productPrice) => {
    const productTotal = document.querySelector(
      `#product-number-${productId} .product-total`
    );
    let productCuantity = document.querySelector(
      `#product-number-${productId} .product-quantity`
    );
    productTotal.textContent = `$${formatNumber(
      deformatNumber(productPrice) * productCuantity.value
    )}`;
  };

  const addToCart = (productId) => {
    // Usar un id específico para el catálogo
    const catalogQuantityInput = document.getElementById(
      `catalog-product-quantity-${productId}`
    );
    const selectedQuantity = parseInt(catalogQuantityInput.value, 10) || 1;

    const existingProductIndex = cart.findIndex(
      (item) => item.id === productId
    );

    if (existingProductIndex !== -1) {
      // Actualizar la cantidad usando la cantidad seleccionada desde el catálogo
      const updatedCart = cart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + selectedQuantity }
          : item
      );
      setCart(updatedCart);
    } else {
      // Añadir el nuevo producto al carrito desde el catálogo
      fetch(
        `https://pos-cevichon-backend-production.up.railway.app/api/products/${productId}`
      )
        .then((response) => response.json())
        .then((data) => {
          setCart([
            ...cart,
            {
              id: data.id,
              name: data.name,
              price: data.price,
              quantity: selectedQuantity,
            },
          ]);
        });
    }
    checkShowCompleteButton();
  };

  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
    checkShowCompleteButton();
  };

  const formatCustomerNumber = (number) => {
    const cleaned = number.replace(/\D/g, "").slice(0, 9); // Limitar a 9 dígitos
    return cleaned
      .replace(/(\d{1})(\d{4})(\d{4})/, "$1 $2 $3")
      .replace(/(\d{1})(\d{4})/, "$1 $2"); // Aplicar formato
  };

  const handleCustomerNumberChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatCustomerNumber(rawValue);
    setCustomerNumber(formattedValue);
    checkShowCompleteButton();
  };

  const handleAddressTypeChange = () => {
    checkShowCompleteButton();
  };

  const handleCustomerAddressChange = () => {
    setCustomerAddress(document.getElementById("direccion-cliente").value);
    checkShowCompleteButton();
  };

  const checkShowCompleteButton = () => {
    const envioDomicilioInput = document.getElementById("direccion1").checked;
    const retiroLocalInput = document.getElementById("direccion2").checked;
    const nombreClienteInput = document.getElementById("nombre-cliente").value;
    const numeroClienteInput = document.getElementById("numero-cliente").value;
    const direccionClienteInput =
      document.getElementById("direccion-cliente").value;
    const direccionContainer = document.querySelector(".direccion-container");

    if (envioDomicilioInput) {
      direccionContainer.classList.remove("hidden");
    } else {
      direccionContainer.classList.add("hidden");
    }

    setTimeout(function () {
      const itemsInBox = document.querySelectorAll(".item-on-cart");

      if (
        itemsInBox.length >= 1 &&
        nombreClienteInput != "" &&
        numeroClienteInput != ""
      ) {
        if (retiroLocalInput) {
          setShowCompleteButton(true);
        }
        if (envioDomicilioInput) {
          if (direccionClienteInput != "") {
            setShowCompleteButton(true);
          } else {
            setShowCompleteButton(false);
          }
        }
      } else {
        setShowCompleteButton(false);
      }
    }, 100);
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
      .catch((err) => console.error("Failed to make a sale:", err));
  };

  const imprimirTest = () => {
    const datos = {
      fecha: "2021-09-01",
      total: 10000,
      boletaNumero: 1,
      productos: [
        { nombre: "Producto 1", precio: 1000, cantidad: 2, total: 2000 },
        { nombre: "Producto 2", precio: 2300, cantidad: 1, total: 2300 },
      ],
    };

    // Llamas a la función que imprime el recibo
    imprimirRecibo(datos);
  };

  const completeOrder = () => {
    let orderStatus = "Pendiente";
    let customAddress = document.getElementById("direccion-cliente").value;
    const retiroLocalInput = document.getElementById("direccion2").checked;
    const newTotal = deformatNumber(total);

    setShowCompleteButton(false);

    if (retiroLocalInput) {
      orderStatus = "Completado";
      customAddress = "LOCAL";
    }

    const now = new Date();
    const orderData = {
      client_name: customerName,
      client_number: customerNumber,
      client_address: customAddress,
      order_time: formatTime(now),
      order_date: now.toISOString().split("T")[0],
      order_total: newTotal,
      order_status: orderStatus,
    };

    // Variable para almacenar el orderId
    let savedOrderId;

    fetch("https://pos-cevichon-backend-production.up.railway.app/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => response.json())
      .then((orderResponse) => {
        savedOrderId = orderResponse.id; // Guardamos el orderId

        const orderItems = cart.map((item) => ({
          order_id: savedOrderId,
          product_id: item.id,
          product_name: item.name,
          product_price: item.price,
          product_quantity: item.quantity,
          product_total: item.price * item.quantity,
        }));

        if (orderStatus === "Completado") {
          makeSale(savedOrderId);
        }

        return fetch(
          "https://pos-cevichon-backend-production.up.railway.app/api/order_items",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              order_id: savedOrderId,
              cartProducts: orderItems,
            }),
          }
        );
      })
      .then((response) => response.json())
      .then(() => {
        // Ahora podemos usar savedOrderId aquí
        const datos = {
          fecha: orderData.order_date,
          total: orderData.order_total,
          boletaNumero: savedOrderId,
          productos: cart.map((item) => ({
            nombre: item.name,
            precio: item.price,
            cantidad: item.quantity,
            total: item.price * item.quantity,
          })),
        };

        // Llamas a la función que imprime el recibo
        imprimirRecibo(datos);

        Swal.fire(
          "¡Pedido Realizado!",
          "El pedido se ha realizado.",
          "success"
        );
        notify("Pedido realizado exitosamente!", 5000, "success");

        // Limpiar estado
        setCart([]);
        setCustomerName("");
        setCustomerNumber("");
        setCustomerAddress("");
        setDiscount(0);
        setTotal(0);
        setShowCompleteButton(false);
        document.querySelector(".direccion-container").classList.add("hidden");
        document.getElementById("direccion2").checked = false;
        document.getElementById("direccion1").checked = false;
        setIsActive(false);
      })
      .catch((error) => {
        notify("Error al realizar el pedido", 5000, "error");
        console.error(error);
        setShowCompleteButton(true);
      });
  };

  const imprimirRecibo = async (datos) => {
    try {
      const result = await ipcRenderer.print(sharedPrinterName, datos);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error al imprimir el recibo:", error);
      notify("Error al imprimir el recibo", 5000, "error");
    }
  };

  const handleQuantityChange = (id, newQuantity) => {
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: parseInt(newQuantity) } : item
    );
    setCart(updatedCart);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountAmount = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmount;

    // Apply IVA if enabled
    const finalAmount = includeIva ? afterDiscount * 1.19 : afterDiscount;

    // Redondear a entero
    const roundedTotal = Math.round(finalAmount);

    const formattedTotal = formatNumber(roundedTotal);
    setTotal(formattedTotal);
  };

  const handleDiscountChange = (e) => {
    setDiscount(parseFloat(e.target.value) || 0);
    if (document.getElementById("discount-input").value > 100) {
      document.getElementById("discount-input").value = 100;
      setDiscount(100);
    }
  };

  return (
    <div id="caja" className="section">
      <h2>Caja</h2>
      <div className="containers">
        <div className="items-container">
          <div id="items-container" className="items-box-container">
            <li className="class-list">
              <p>Nombre</p>
              <p>Precio</p>
              <p>Cantidad</p>
              <p id="total-class">Total</p>
            </li>
            {cart.length === 0 && (
              <p id="no-products">No hay productos Añadidos.</p>
            )}
            {cart.map((item) => (
              <li
                key={item.id}
                id={`cart-item-${item.id}`}
                className="item-on-cart"
              >
                <p className="product-name">{item.name}</p>
                <p className="product-price">${formatNumber(item.price)}</p>
                <input
                  type="number"
                  className="product-quantity"
                  id={`product-quantity-${item.id}-input`}
                  value={item.quantity}
                  min="1"
                  onChange={(e) =>
                    handleQuantityChange(item.id, e.target.value)
                  }
                />
                <p id={`total-${item.id}`} className="product-total">
                  ${formatNumber(item.price * item.quantity)}
                </p>
                <button
                  id="delete-product-cart"
                  onClick={() => {
                    setCart(cart.filter((cartItem) => cartItem.id !== item.id));
                    checkShowCompleteButton();
                  }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </div>
          <button
            id="add-product-button"
            className="add-product"
            onClick={() => {
              handleAddProduct();
            }}
            style={{ backgroundColor: isActive ? "gray" : "rgb(255, 190, 49)" }}
          >
            {isActive ? "Cancelar" : "Añadir Manualmente"}
          </button>
          <div
            id="products-catalog"
            className="scale-in"
            style={{ display: isActive ? "flex" : "none" }}
          >
            <h3>Tus Productos</h3>
            <li className="class-list">
              <p>Nombre</p>
              <p>Precio</p>
              <p>Stock</p>
              <p>Cantidad</p>
              <p>Total</p>
            </li>
            {products.length > 0 ? (
              products.map((product) => (
                <li
                  key={product.id}
                  id={"product-number-" + product.id}
                  className="item-on-products"
                >
                  <p className="product-name">{product.name}</p>
                  <p className="product-price">
                    ${formatNumber(product.price)}
                  </p>
                  <p className="product-stock">{formatNumber(product.stock)}</p>
                  <input
                    type="number"
                    className="product-quantity"
                    id={`catalog-product-quantity-${product.id}`}
                    defaultValue="1"
                    min="1"
                    onChange={() =>
                      actualizarCantidad(product.id, product.price)
                    }
                  />
                  <p className="product-total">
                    ${formatNumber(product.price)}
                  </p>
                  <button
                    onClick={() => {
                      addToCart(product.id);
                      checkShowCompleteButton();
                    }}
                  >
                    Añadir
                  </button>
                </li>
              ))
            ) : (
              <p style={{ marginTop: "2rem" }}>No hay productos añadidos.</p>
            )}
          </div>
        </div>
        <div className="caja-container">
          <div className="detalles-container">
            <div className="printer-selection-container">
              <label
                htmlFor="printer-select"
                className="block mb-2 text-sm font-medium"
              >
                Impresora:
              </label>
              <div className="print-list-container">
                <select
                  id="printer-select"
                  value={sharedPrinterName || ""}
                  onChange={(e) => setSharedPrinterName(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Seleccionar impresora</option>
                  {printersListOptions}
                </select>
                <button
                  onClick={handleRefreshPrinters}
                  className="refresh-printers-button"
                >
                  <span className="material-symbols-rounded">refresh</span>
                </button>
              </div>
              <button className="hidden" onClick={imprimirTest}>
                TEST
              </button>
            </div>

            <div className="nombre-cliente-container">
              <p>Nombre del cliente:</p>
              <input
                type="text"
                placeholder="Nombre del Cliente"
                id="nombre-cliente"
                value={customerName}
                onChange={handleCustomerNameChange}
              />
            </div>
            <div className="nombre-cliente-container">
              <p>Numero del cliente:</p>
              <input
                type="text"
                placeholder="Ej: 9 1234 5678"
                id="numero-cliente"
                value={customerNumber}
                onChange={handleCustomerNumberChange}
              />
            </div>
            <div className="location-container">
              <label htmlFor="direccion" style={{ marginBottom: ".5rem" }}>
                Selecciona el tipo de direccion:
              </label>
              <div className="selection-container">
                <div className="select-1">
                  <input
                    type="radio"
                    name="direccion"
                    id="direccion1"
                    value="delivery"
                    onChange={handleAddressTypeChange}
                  />
                  <label htmlFor="direccion1">Envio a Domicilio</label>
                </div>
                <div className="select-2">
                  <input
                    type="radio"
                    name="direccion"
                    id="direccion2"
                    value="local"
                    onChange={handleAddressTypeChange}
                  />
                  <label htmlFor="direccion2">Retiro en Local</label>
                </div>
              </div>
              <div
                className="direccion-container hidden"
                style={{ marginTop: ".5rem", marginBottom: ".5rem" }}
              >
                <label htmlFor="location">Direccion del cliente:</label>
                <input
                  style={{ marginTop: ".5rem" }}
                  type="text"
                  placeholder="Ej: ohiggins 1511"
                  id="direccion-cliente"
                  value={customerAddress}
                  onChange={handleCustomerAddressChange}
                />
              </div>
            </div>
            <div className="descuento-container">
              <p>Descuento (%):</p>
              <input
                type="number"
                placeholder="%"
                max="100"
                min="0"
                value={discount}
                id="discount-input"
                onChange={handleDiscountChange}
              />
            </div>
            <div className="iva-container">
              <div className="iva-toggle">
                <label htmlFor="iva-checkbox">Incluir IVA (19%)</label>
                <input
                  type="checkbox"
                  id="iva-checkbox"
                  checked={includeIva}
                  onChange={(e) => setIncludeIva(e.target.checked)}
                />
              </div>
            </div>
            <div className="subtotal-container">
              <h4>Subtotal: </h4>
              <h4 id="subtotal-cart">
                $
                {formatNumber(
                  Math.round(
                    cart.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    ) *
                      (1 - discount / 100)
                  )
                )}
              </h4>
            </div>
          </div>

          <div className="total-container">
            <h4>Total: </h4>
            <h4 id="total-cart">${total}</h4>
          </div>
          {showCompleteButton && (
            <button id="complete-button" onClick={completeOrder}>
              Completar Pedido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Atm;
