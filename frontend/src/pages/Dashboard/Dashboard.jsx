import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// import Header from "../../components/layout/Header";
// import Sidebar from "../../components/layout/Sidebar";
// import BottomNav from "../../components/layout/BottomNav";

import "./Dashboard.css";

import boxIcon from "../../assets/icons/box.png";
import micIcon from "../../assets/icons/mic.png";
import chevronIcon from "../../assets/icons/chevron.png";

import * as billService from "../../services/billService";
import * as inventoryService from "../../services/inventoryService";

const LOW_STOCK_THRESHOLD = 5;

export default function Dashboard() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState("");
  const [sales, setSales] = useState("₹0.00");
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const today = new Date().toLocaleDateString(
      "en-US",
      options
    );

    setCurrentDate(today);

    const loadDashboardData = async () => {
      setIsLoading(true);

      try {
        const todayIso = new Date().toISOString().slice(0, 10);

        const [bills, inventory] = await Promise.all([
          billService.getBillHistory({ date: todayIso }),
          inventoryService.getInventory(),
        ]);

        const todaysSales = bills
          .filter((bill) => bill.status !== "VOID")
          .reduce((sum, bill) => sum + Number(bill.grand_total || 0), 0);

        setSales(`₹${todaysSales.toFixed(2)}`);

        const lowStock = inventory.filter(
          (item) => item.qty > 0 && item.qty <= LOW_STOCK_THRESHOLD
        ).length;

        setLowStockCount(lowStock);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="main-content">

        {/* ================= SIDEBAR ================= */}
        {/* {sidebarOpen && <Sidebar />} */}

        {/* ================= DASHBOARD CONTENT ================= */}
        {/* <main
          className={
            sidebarOpen
              ? "main-content sidebar-open"
              : "main-content"
          }
        > */}

          {/* Welcome Banner */}
          <div className="card-welcome">
            <div className="card-content">

              <p className="card-date">
                {currentDate}
              </p>

              <h1 className="welcome-title">
                Welcome Back,
                <br />
                ProShop
              </h1>

            </div>
          </div>

          {/* ================= STAT CARDS ================= */}
          <div className="stats-row">

            <div className="stat-card">

              <p className="stat-label">
                Today's Sales
              </p>

              <p className="stat-value">
                {isLoading ? "…" : sales}
              </p>

            </div>

            <div className="stat-card">

              <p className="stat-label">
                Low Stock
              </p>

              <div className="stat-value-container">

                <p className="stat-value low-stock-number">
                  {isLoading ? "…" : lowStockCount}
                </p>

                <p className="stat-items-label">
                  items
                </p>

              </div>

            </div>

          </div>

          {/* ================= QUICK ACTIONS ================= */}
          <div className="section-heading">
            <h2>Quick Actions</h2>
          </div>

          {/* ================= INVENTORY ================= */}
          <button
            type="button"
            className="card-action"
            onClick={() => navigate("/inventory")}
          >

            <div className="card-link">

              <div className="action-left">

                <div className="card-icon inventory-icon-background">
                  <img
                    src={boxIcon}
                    alt="Inventory"
                  />
                </div>

                <div className="card-text">

                  <h2 className="card-title">
                    Inventory
                  </h2>

                  <span className="card-subtitle">
                    Manage your stock
                  </span>

                </div>

              </div>

              <div className="card-arrow">

                <img
                  src={chevronIcon}
                  alt="Go to Inventory"
                />

              </div>

            </div>

          </button>

          {/* ================= BILLING ================= */}
          <button
            type="button"
            className="card-action"
            onClick={() => navigate("/billing")}
          >

            <div className="card-link">

              <div className="action-left">

                <div className="card-icon billing-icon-background">

                  <img
                    src={micIcon}
                    alt="Billing"
                  />

                </div>

                <div className="card-text">

                  <h2 className="card-title">
                    Billing
                  </h2>

                  <span className="card-subtitle">
                    Create a bill by speaking
                  </span>

                </div>

              </div>

              <div className="card-arrow">

                <img
                  src={chevronIcon}
                  alt="Go to Billing"
                />

              </div>

            </div>

          </button>



      </div>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {/* <BottomNav /> */}
  </>

  );
}
