import React ,{useState} from "react";
import { Outlet } from "react-router-dom";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import BottomNav from "../../components/layout/BottomNav";

import "./AppShell.css";

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerAction, setHeaderAction] = useState(null);

  const handleMenuToggle = () => {
    setSidebarOpen((previous) => !previous);
  };

  return (
    <div className="app-shell">

      {/* ================= HEADER ================= */}
      <Header
        onMenuToggle={handleMenuToggle}
        onAddProduct={headerAction}
      />

      {/* ================= BODY ================= */}
      <div className="app-shell-body">

        {/* ================= SIDEBAR ================= */}
        <Sidebar isOpen={sidebarOpen} />

        {/* ================= PAGE CONTENT ================= */}
        <main
          className={
            sidebarOpen
              ? "app-shell-content sidebar-open"
              : "app-shell-content"
          }
        >
          <Outlet
            context={{
              setHeaderAction,
            }}
          />

          {/* ================= FOOTER ================= */}
          <div className="app-shell-footer">
            <footer>
              <span>Copyright @2026</span>
            </footer>
          </div>
        </main>

      </div>

      {/* ================= MOBILE NAV ================= */}
      <BottomNav />
    </div>
  );
}

export default AppShell;

