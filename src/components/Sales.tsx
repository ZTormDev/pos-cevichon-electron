import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// Interfaces for type safety
interface Product {
  id: number;
  name: string;
}

interface OrderItem {
  product_id: number;
  product_name: string;
  product_quantity: number;
  product_total: number;
}

interface Order {
  order_id?: number;
  order_total: number;
  items: OrderItem[];
}

interface Sale {
  id: number;
  order_id: number;
  sale_date: string;
  order: Order;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
  }>;
}

interface TopProduct {
  name: string;
  count: number;
}

const Sales: React.FC = () => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [monthlySales, setMonthlySales] = useState<ChartData | null>(null);
  const [weeklySales, setWeeklySales] = useState<ChartData | null>(null);
  const [dailySales, setDailySales] = useState<ChartData | null>(null);
  const [monthlySalesCount, setMonthlySalesCount] = useState<ChartData | null>(
    null
  );
  const [weeklySalesCount, setWeeklySalesCount] = useState<ChartData | null>(
    null
  );
  const [dailySalesCount, setDailySalesCount] = useState<ChartData | null>(
    null
  );
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [currentMonthEarnings, setCurrentMonthEarnings] = useState<number>(0);
  const [currentWeekEarnings, setCurrentWeekEarnings] = useState<number>(0);
  const [currentDayEarnings, setCurrentDayEarnings] = useState<number>(0);
  const [currentMonthSalesCount, setCurrentMonthSalesCount] =
    useState<number>(0);
  const [currentWeekSalesCount, setCurrentWeekSalesCount] = useState<number>(0);
  const [currentDaySalesCount, setCurrentDaySalesCount] = useState<number>(0);
  const [totalSalesCount, setTotalSalesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [visibleSale, setVisibleSale] = useState<number | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [chartKeys, setChartKeys] = useState({
    monthly: "monthly-chart",
    weekly: "weekly-chart",
    daily: "daily-chart",
  });

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const salesResponse = await axios.get<{ data: Sale[] }>(
          "https://pos-cevichon-backend-production.up.railway.app/api/sales"
        );
        const sales = salesResponse.data.data;
        const salesWithOrders = await fetchOrdersAndItems(sales);

        setSalesData(salesWithOrders);
        processSalesData(salesWithOrders);
        calculateTotalEarnings(salesWithOrders);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCatalogProducts = async () => {
      try {
        const productsResponse = await axios.get<{ data: Product[] }>(
          "https://pos-cevichon-backend-production.up.railway.app/api/products"
        );
        setCatalogProducts(productsResponse.data.data);
      } catch (error) {
        console.error("Error fetching catalog products:", error);
      }
    };

    fetchCatalogProducts();
    fetchSalesData();
  }, []);

  useEffect(() => {
    if (catalogProducts.length > 0 && salesData.length > 0) {
      const getTopProducts = async () => {
        const productCounts: { [key: string]: number } = {};

        salesData.forEach((sale) => {
          const items = sale.order.items;

          items.forEach((item) => {
            if (item) {
              const product = catalogProducts.find(
                (p) => p.id === item.product_id
              );

              if (product) {
                productCounts[item.product_name] =
                  (productCounts[item.product_name] || 0) +
                  item.product_quantity;
              }
            }
          });
        });

        const sortedProducts = Object.entries(productCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([name, count]) => ({ name, count }));

        setTopProducts(sortedProducts.slice(0, 5));
      };

      getTopProducts();
    }
  }, [catalogProducts, salesData]);

  const sortSalesById = (sales: Sale[]): Sale[] => {
    return sales.sort((a, b) => b.id - a.id);
  };

  const fetchOrdersAndItems = async (sales: Sale[]): Promise<Sale[]> => {
    const sortedSales = sortSalesById(sales);
    return Promise.all(
      sortedSales.map(async (sale) => {
        try {
          const orderResponse = await axios.get<Order>(
            `https://pos-cevichon-backend-production.up.railway.app/api/orders/${sale.order_id}`
          );
          const itemsResponse = await axios.get<{ data: OrderItem[] }>(
            `https://pos-cevichon-backend-production.up.railway.app/api/order_items/`
          );

          return {
            ...sale,
            order: {
              ...orderResponse.data,
              items: itemsResponse.data.data.filter(
                (item) => item.product_id === sale.order_id
              ),
            },
          };
        } catch (error) {
          console.error(
            `Error fetching data for sale ${sale.order_id}:`,
            error
          );
          return {
            ...sale,
            order: {
              order_total: 0,
              items: [],
            },
          };
        }
      })
    );
  };

  const processSalesData = (sales: Sale[]): void => {
    const monthlyEarnings: { [key: string]: number } = {};
    const weeklyEarnings: { [key: string]: number } = {};
    const dailyEarnings: { [key: string]: number } = {};
    const monthlyCounts: { [key: string]: number } = {};
    const weeklyCounts: { [key: string]: number } = {};
    const dailyCounts: { [key: string]: number } = {};

    sales.forEach((sale) => {
      const date = new Date(sale.sale_date);
      const total = sale.order.order_total || 0;

      // Ventas por mes
      const month = `${date.getFullYear()}-${date.getMonth() + 1}`;
      monthlyEarnings[month] = (monthlyEarnings[month] || 0) + total;
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;

      // Ventas por semana
      const week = `${date.getFullYear()}-${getWeekNumber(date)}`;
      weeklyEarnings[week] = (weeklyEarnings[week] || 0) + total;
      weeklyCounts[week] = (weeklyCounts[week] || 0) + 1;

      // Ventas por día
      const day = date.toISOString().split("T")[0];
      dailyEarnings[day] = (dailyEarnings[day] || 0) + total;
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    setMonthlySales({
      labels: Object.keys(monthlyEarnings),
      datasets: [
        {
          label: "Ganancias por mes",
          data: Object.values(monthlyEarnings),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    });

    setWeeklySales({
      labels: Object.keys(weeklyEarnings),
      datasets: [
        {
          label: "Ganancias por semana",
          data: Object.values(weeklyEarnings),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
        },
      ],
    });

    setDailySales({
      labels: Object.keys(dailyEarnings),
      datasets: [
        {
          label: "Ganancias por día",
          data: Object.values(dailyEarnings),
          backgroundColor: "rgba(255, 159, 64, 0.6)",
        },
      ],
    });

    setMonthlySalesCount({
      labels: Object.keys(monthlyCounts),
      datasets: [
        {
          label: "Número de ventas por mes",
          data: Object.values(monthlyCounts),
          backgroundColor: "rgba(75, 192, 192, 0.4)",
        },
      ],
    });

    setWeeklySalesCount({
      labels: Object.keys(weeklyCounts),
      datasets: [
        {
          label: "Número de ventas por semana",
          data: Object.values(weeklyCounts),
          backgroundColor: "rgba(153, 102, 255, 0.4)",
        },
      ],
    });

    setDailySalesCount({
      labels: Object.keys(dailyCounts),
      datasets: [
        {
          label: "Número de ventas por día",
          data: Object.values(dailyCounts),
          backgroundColor: "rgba(255, 159, 64, 0.4)",
        },
      ],
    });

    // Calculate current period totals
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const currentWeek = `${now.getFullYear()}-${getWeekNumber(now)}`;
    const currentDay = now.toISOString().split("T")[0];

    const getTotalForPeriod = (data: any, period: any) => {
      const filteredData = Object.keys(data).filter((key) => key === period);
      return filteredData.reduce((sum, key) => sum + (data[key] || 0), 0);
    };

    setCurrentMonthEarnings(getTotalForPeriod(monthlyEarnings, currentMonth));
    setCurrentWeekEarnings(getTotalForPeriod(weeklyEarnings, currentWeek));
    setCurrentDayEarnings(getTotalForPeriod(dailyEarnings, currentDay));

    setCurrentMonthSalesCount(getTotalForPeriod(monthlyCounts, currentMonth));
    setCurrentWeekSalesCount(getTotalForPeriod(weeklyCounts, currentWeek));
    setCurrentDaySalesCount(getTotalForPeriod(dailyCounts, currentDay));

    // Calculate total sales count
    const totalCount = sales.length;
    setTotalSalesCount(totalCount);
  };

  const calculateTotalEarnings = (sales: Sale[]) => {
    const total = sales.reduce(
      (sum, sale) => sum + (sale.order.order_total || 0),
      0
    );
    setTotalEarnings(total);
  };

  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const formatNumber = (number: number): string => {
    const parts = number.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
  };

  // Obtener las últimas 4 ventas
  const sortedSales = sortSalesById(salesData);
  const latestSales = sortedSales.slice(0, 4);

  const toggleSaleProducts = (saleId: number) => {
    setVisibleSale(visibleSale === saleId ? null : saleId);
  };

  if (loading) {
    return (
      <SkeletonTheme
        baseColor="var(--skeleton-card-bg)"
        highlightColor="var(--skeleton-card-highlight)"
        borderRadius={"1rem"}
      >
        <div className="sales-section">
          <div className="latest-sales">
            <div className="sales-container">
              <h2>Últimas Ventas</h2>
              <div
                className={`sale top-sale collapsed`}
                style={{ padding: "1.5rem 1rem" }}
              >
                <Skeleton height={"5rem"} borderRadius={"5rem"}></Skeleton>
              </div>
              <div
                className={`sale sale-2 collapsed`}
                style={{ padding: "1.5rem 1rem" }}
              >
                <Skeleton height={"5rem"} borderRadius={"5rem"}></Skeleton>
              </div>
              <div
                className={`sale sale-3 collapsed`}
                style={{ padding: "1.5rem 1rem" }}
              >
                <Skeleton height={"5rem"} borderRadius={"5rem"}></Skeleton>
              </div>
              <div
                className={`sale sale-4 collapsed`}
                style={{ padding: "1.5rem 1rem" }}
              >
                <Skeleton height={"5rem"} borderRadius={"5rem"}></Skeleton>
              </div>
            </div>
            <div className="top-products-container">
              <h2>Top 5 Productos</h2>
              <div className="top-products">
                <div className="top-product" id={"product-1"}>
                  <Skeleton
                    circle
                    width={"3rem"}
                    height={"3rem"}
                    baseColor="var(--skeleton-card-bg-2)"
                    highlightColor="var(--skeleton-card-highlight-2)"
                  ></Skeleton>
                  <div className="top-product-details">
                    <h4>
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </h4>
                    <p className="subtitle">
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </p>
                  </div>
                </div>
                <div className="top-product" id={"product-1"}>
                  <Skeleton
                    circle
                    width={"3rem"}
                    height={"3rem"}
                    baseColor="var(--skeleton-card-bg-2)"
                    highlightColor="var(--skeleton-card-highlight-2)"
                  ></Skeleton>
                  <div className="top-product-details">
                    <h4>
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </h4>
                    <p className="subtitle">
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </p>
                  </div>
                </div>
                <div className="top-product" id={"product-1"}>
                  <Skeleton
                    circle
                    width={"3rem"}
                    height={"3rem"}
                    baseColor="var(--skeleton-card-bg-2)"
                    highlightColor="var(--skeleton-card-highlight-2)"
                  ></Skeleton>
                  <div className="top-product-details">
                    <h4>
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </h4>
                    <p className="subtitle">
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </p>
                  </div>
                </div>
                <div className="top-product" id={"product-1"}>
                  <Skeleton
                    circle
                    width={"3rem"}
                    height={"3rem"}
                    baseColor="var(--skeleton-card-bg-2)"
                    highlightColor="var(--skeleton-card-highlight-2)"
                  ></Skeleton>
                  <div className="top-product-details">
                    <h4>
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </h4>
                    <p className="subtitle">
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </p>
                  </div>
                </div>
                <div className="top-product" id={"product-1"}>
                  <Skeleton
                    circle
                    width={"3rem"}
                    height={"3rem"}
                    baseColor="var(--skeleton-card-bg-2)"
                    highlightColor="var(--skeleton-card-highlight-2)"
                  ></Skeleton>
                  <div className="top-product-details">
                    <h4>
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </h4>
                    <p className="subtitle">
                      <Skeleton
                        baseColor="var(--skeleton-card-bg-2)"
                        highlightColor="var(--skeleton-card-highlight-2)"
                      ></Skeleton>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2>Ventas</h2>

          <div className="graphics-container">
            <div className="graphic">
              <Skeleton
                height={"12rem"}
                style={{ marginBottom: "1rem" }}
              ></Skeleton>
              <Skeleton height={"2rem"}></Skeleton>
            </div>
            <div className="graphic">
              <Skeleton
                height={"12rem"}
                style={{ marginBottom: "1rem" }}
              ></Skeleton>
              <Skeleton height={"2rem"}></Skeleton>
            </div>
            <div className="graphic">
              <Skeleton
                height={"12rem"}
                style={{ marginBottom: "1rem" }}
              ></Skeleton>
              <Skeleton height={"2rem"}></Skeleton>
            </div>
          </div>
          <Skeleton
            width={"25rem"}
            height={"4rem"}
            style={{
              boxShadow: "0px 0px 10px var(--shadow-color)",
              marginBottom: "2rem",
            }}
          ></Skeleton>

          <div className="graphics-container">
            <div className="graphic">
              <Skeleton
                height={"12rem"}
                style={{ marginBottom: "1rem" }}
              ></Skeleton>
              <Skeleton height={"2rem"}></Skeleton>
            </div>
            <div className="graphic">
              <Skeleton
                height={"12rem"}
                style={{ marginBottom: "1rem" }}
              ></Skeleton>
              <Skeleton height={"2rem"}></Skeleton>
            </div>
            <div className="graphic">
              <Skeleton
                height={"12rem"}
                style={{ marginBottom: "1rem" }}
              ></Skeleton>
              <Skeleton height={"2rem"}></Skeleton>
            </div>
          </div>
          <Skeleton
            width={"25rem"}
            height={"4rem"}
            style={{
              boxShadow: "0px 0px 10px var(--shadow-color)",
              marginBottom: "2rem",
            }}
          ></Skeleton>
        </div>
      </SkeletonTheme>
    );
  }

  if (salesData.length > 0) {
    return (
      <div className="sales-section">
        <div
          style={{ marginBottom: latestSales.length === 3 ? "-5rem" : "0rem" }}
          className="latest-sales"
        >
          <div className="sales-container">
            <h2>Últimas Ventas</h2>
            {latestSales.map((sale, index) => {
              let className;
              switch (index) {
                case 0:
                  className = "most-recent";
                  break;
                case 1:
                  className = "sale-2";
                  break;
                case 2:
                  className = "sale-3";
                  break;
                case 3:
                  className = "sale-4";
                  break;
                default:
                  className = "";
              }

              const isVisible = visibleSale === sale.order_id;

              return (
                <div
                  key={sale.order_id}
                  className={`sale ${className} ${
                    isVisible ? "expanded" : "collapsed"
                  }`}
                  style={{ padding: isVisible ? "1.5rem 1rem" : "2.5rem 1rem" }} // Cambiar padding dependiendo de si está expandido
                >
                  <div className="title-sales">
                    <div className="sale-number">
                      <h4>Venta #{sale.order_id}</h4>
                      <p className="sale-date">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      id="dropdown-button"
                      className="material-symbols-rounded"
                      onClick={() => toggleSaleProducts(sale.order_id)}
                    >
                      {isVisible ? "arrow_drop_up" : "arrow_drop_down"}
                    </button>
                    <h4 className="gain-number">
                      +$
                      {formatNumber(Number(sale.order.order_total.toFixed(0)))}
                    </h4>
                  </div>
                  <div className={`sale-products ${isVisible ? "" : "hidden"}`}>
                    <ul>
                      {sale.order.items.map((item) => {
                        return (
                          <li
                            key={
                              item.product_id + Math.floor(Math.random() * 100)
                            }
                          >
                            <p>ID: {item.product_id}</p>
                            <p>{item.product_name}</p>
                            <p>Cantidad: {item.product_quantity}</p>
                            <p>
                              Total: $
                              {formatNumber(
                                Number(item.product_total.toFixed(0))
                              )}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {topProducts.length >= 5 ? (
            <div className="top-products-container">
              <h2>Top 5 Productos</h2>
              <div className="top-products">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="top-product"
                    id={"product-" + index}
                  >
                    <p className={"top-number number" + (index + 1)}>
                      {index + 1}
                    </p>
                    <div className="top-product-details">
                      <h4>{product.name}</h4>
                      <p className="subtitle">
                        Cantidad comprada: {product.count}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <h2>Ventas</h2>

        <div className="graphics-container">
          <div className="graphic">
            {monthlySales && (
              <Bar key={chartKeys.monthly} data={monthlySales} />
            )}
            <p>
              Ganancias por Mes: $
              {formatNumber(Number(currentMonthEarnings.toFixed(0)))}
            </p>
          </div>
          <div className="graphic">
            {weeklySales && <Bar key={chartKeys.weekly} data={weeklySales} />}
            <p>
              Ganancias por Semana: $
              {formatNumber(Number(currentWeekEarnings.toFixed(0)))}
            </p>
          </div>
          <div className="graphic">
            {dailySales && <Bar key={chartKeys.daily} data={dailySales} />}
            <p>
              Ganancias por Día: $
              {formatNumber(Number(currentDayEarnings.toFixed(0)))}
            </p>
          </div>
        </div>

        <h3>Total Ganado: ${formatNumber(Number(totalEarnings.toFixed(0)))}</h3>

        <div className="graphics-container">
          <div className="graphic">
            {monthlySalesCount && (
              <Bar key={chartKeys.monthly} data={monthlySalesCount} />
            )}
            <p>Número de Ventas por Mes: {currentMonthSalesCount}</p>
          </div>
          <div className="graphic">
            {weeklySalesCount && (
              <Bar key={chartKeys.weekly} data={weeklySalesCount} />
            )}
            <p>Número de Ventas por Semana: {currentWeekSalesCount}</p>
          </div>
          <div className="graphic">
            {dailySalesCount && (
              <Bar key={chartKeys.daily} data={dailySalesCount} />
            )}
            <p>Número de Ventas por Día: {currentDaySalesCount}</p>
          </div>
        </div>
        <h3>Ventas Totales: {totalSalesCount}</h3>
      </div>
    );
  } else {
    return (
      <p className="loading-text">
        No hay ventas, has al menos una venta para ver esta seccion.
      </p>
    );
  }
};

export default Sales;
