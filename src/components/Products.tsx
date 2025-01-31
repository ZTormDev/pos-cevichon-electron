import { useEffect, useState } from "react";
import { useNotification } from "./useNotification";
import Swal from "sweetalert2";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga
  const [editProductId, setEditProductId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const { notify } = useNotification();
  const [showAddProduct, setShowAddProduct] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setIsLoading(true);
    fetch("https://pos-cevichon-backend-production.up.railway.app/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.data);

        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  };

  function formatNumber(number) {
    const parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
  }

  const toggleEdit = (product) => {
    if (editProductId === product.id) {
      setEditProductId(null);
    } else {
      setEditProductId(product.id);
      setEditValues({ price: product.price, stock: product.stock });
    }
  };

  const handleSave = (productId) => {
    const { price, stock } = editValues;

    if (!token) {
      console.error("No token found");
      return;
    }

    fetch(
      `https://pos-cevichon-backend-production.up.railway.app/api/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ price, stock }),
      }
    )
      .then((response) => {
        if (response.ok) {
          notify("Producto Guardado!", 3000, "success");
          loadProducts();
          setEditProductId(null);
        } else {
          return response.json().then((err) => {
            throw new Error(err.message || "Failed to save changes");
          });
        }
      })
      .catch((err) => {
        console.error("Error saving changes:", err);
        notify("Error al guardar cambios", 5000, "error");
      });
  };

  const handleCancel = () => {
    setEditProductId(null);
  };

  const handleChange = (e) => {
    setEditValues({ ...editValues, [e.target.name]: e.target.value });
  };

  const deleteProduct = (productId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "rgb(68, 180, 255)",
      cancelButtonColor: "rgb(253, 80, 80)",
      confirmButtonText: "Sí, eliminarlo",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(
          `https://pos-cevichon-backend-production.up.railway.app/api/products/${productId}`,
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
              notify("Producto eliminado exitosamente", 5000, "success");
              loadProducts();
            } else {
              throw new Error("Failed to delete product");
            }
          })
          .catch((err) =>
            notify("Error al eliminar el producto", 5000, "error")
          );

        Swal.fire("¡Eliminado!", "Tu archivo ha sido eliminado.", "success");
      }
    });
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    const name = document.getElementById("product-name").value;
    const price = parseFloat(document.getElementById("product-price").value);
    const stock = parseInt(document.getElementById("product-stock").value, 10);
    setShowAddProduct(false);
    addProduct(name, price, stock);
  };

  const addProduct = (name, price, stock) => {
    fetch(
      "https://pos-cevichon-backend-production.up.railway.app/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price, stock }),
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to add product");
        }
      })
      .then((data) => {
        notify("Producto añadido correctamente", 5000, "success");
        loadProducts();
        document.getElementById("product-name").value = "";
        document.getElementById("product-price").value = "";
        document.getElementById("product-stock").value = "";
        setShowAddProduct(true);
      })
      .catch((err) => {
        notify("Error al agregar el producto", 5000, "error");
        setShowAddProduct(true);
      });
  };

  if (isLoading) {
    return (
      <SkeletonTheme
        baseColor="var(--skeleton-card-bg)"
        highlightColor="var(--skeleton-card-highlight)"
        borderRadius={"1rem"}
      >
        <div id="product-management" className="section">
          <h2>Administrar Inventario</h2>
          <div className="product-container">
            <div id="products-list">
              <ul className="class-table">
                <li>ID</li>
                <li>Nombre</li>
                <li>Precio</li>
                <li>Stock</li>
              </ul>
              <ul
                id="products"
                style={{
                  backgroundColor: "var(--card-bg-color)",
                  padding: ".5rem 1rem",
                }}
              >
                <Skeleton
                  height={"3rem"}
                  style={{ marginBlock: ".3rem" }}
                  borderRadius={".5rem"}
                ></Skeleton>
                <Skeleton
                  height={"3rem"}
                  style={{ marginBlock: ".3rem" }}
                  borderRadius={".5rem"}
                ></Skeleton>
                <Skeleton
                  height={"3rem"}
                  style={{ marginBlock: ".3rem" }}
                  borderRadius={".5rem"}
                ></Skeleton>
              </ul>
            </div>
            <div id="product-form">
              <h3>Añadir Producto</h3>
              <form>
                <Skeleton
                  borderRadius={".5rem"}
                  width={"15rem"}
                  height={"2rem"}
                  count={3}
                  style={{ marginBottom: "1rem" }}
                ></Skeleton>
                <Skeleton
                  borderRadius={".5rem"}
                  width={"15rem"}
                  height={"3rem"}
                  style={{ marginTop: "1rem" }}
                ></Skeleton>
              </form>
            </div>
          </div>
        </div>
      </SkeletonTheme>
    );
  }

  return (
    <div id="product-management" className="section">
      <h2>Administrar Inventario</h2>
      <div className="product-container">
        <div id="products-list">
          <ul className="class-table">
            <li>ID</li>
            <li>Nombre</li>
            <li>Precio</li>
            <li>Stock</li>
          </ul>
          <ul id="products" style={{ backgroundColor: "var(--card-bg-color)" }}>
            {products.length === 0 ? (
              <p style={{ textAlign: "center", marginBlock: "2rem" }}>
                No hay productos añadidos.
              </p>
            ) : (
              products.map((product) => (
                <li key={product.id} className={product.id}>
                  <p className="product-id">{product.id}</p>
                  <p className="product-name">{product.name}</p>
                  {editProductId === product.id ? (
                    <>
                      <input
                        type="number"
                        className="product-price-edit"
                        value={editValues.price}
                        name="price"
                        onChange={handleChange}
                      />
                      <input
                        type="number"
                        className="product-stock-edit"
                        value={editValues.stock}
                        name="stock"
                        onChange={handleChange}
                      />
                      <button
                        className="save-button"
                        onClick={() => handleSave(product.id)}
                      >
                        Guardar
                      </button>
                      <button className="cancel-button" onClick={handleCancel}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="product-price">
                        <span className="product-price-value">
                          ${formatNumber(product.price)}
                        </span>
                      </p>
                      <p className="product-stock">
                        <span className="product-stock-value">
                          {formatNumber(product.stock)}
                        </span>
                      </p>
                      <button
                        className="edit-button"
                        onClick={() => toggleEdit(product)}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Borrar
                      </button>
                    </>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
        <div id="product-form">
          <h3>Añadir Producto</h3>
          <form onSubmit={handleAddProduct}>
            <input
              type="text"
              id="product-name"
              placeholder="Nombre del Producto"
              required
            />
            <input
              type="number"
              id="product-price"
              placeholder="Precio"
              min="0"
              required
            />
            <input
              type="number"
              id="product-stock"
              placeholder="Stock"
              min="0"
              required
            />
            {showAddProduct && <button type="submit">Añadir Producto</button>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Products;
