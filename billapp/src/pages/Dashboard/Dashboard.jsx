import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// import Header from "../../components/layout/Header";
// import Sidebar from "../../components/layout/Sidebar";
// import BottomNav from "../../components/layout/BottomNav";

import "./Dashboard.css";

import boxIcon from "../../assets/icons/box.png";
import micIcon from "../../assets/icons/mic.png";
import chevronIcon from "../../assets/icons/chevron.png";

export default function Dashboard() {
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState("");
  const [sales, setSales] = useState("₹0.00");
  const [lowStockCount, setLowStockCount] = useState(0);

  // --------- SIDEBAR STATE ---------
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  // const handleMenuToggle = () => {
  //   setSidebarOpen((previous) => !previous);
  // };

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

    // Temporary dashboard values
    setSales("₹12,450.00");
    setLowStockCount(5);
  }, []);

  return (
    <>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="main-container">

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
                {sales}
              </p>

            </div>

            <div className="stat-card">

              <p className="stat-label">
                Low Stock
              </p>

              <div className="stat-value-container">

                <p className="stat-value low-stock-number">
                  {lowStockCount}
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