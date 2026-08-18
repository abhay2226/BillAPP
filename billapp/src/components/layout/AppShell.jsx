import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import BottomNav from "../../components/layout/BottomNav";
// import UserProfile from "../../";

import "./AppShell.css";

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [headerAction, setHeaderAction] = useState(null);
//   const [profileOpen, setProfileOpen] = useState(false);

//   const openProfile = () => setProfileOpen(true);
//   const closeProfile = () => setProfileOpen(false);

  const handleMenuToggle = () => {
    setSidebarOpen((previous) => !previous);
  };

  return (
    <div className="app-shell">

      <Header onMenuToggle={handleMenuToggle} onAddProduct={headerAction} />

      <div className="app-shell-body">

        {/* <Sidebar isOpen={sidebarOpen} onProfileClick={openProfile} /> */}
        <Sidebar isOpen={sidebarOpen} />

        <main
          className={sidebarOpen ? "app-shell-content sidebar-open" : "app-shell-content"}
        >
          <Outlet context={{ setHeaderAction }} />

          <div className="app-shell-footer">
            <footer>
              <span>Copyright @2026</span>
            </footer>
          </div>
        </main>

      </div>

      {/* <BottomNav onProfileClick={openProfile} /> */}
      <BottomNav />

      {/* <UserProfile isOpen={profileOpen} onClose={closeProfile} /> */}
    </div>
  );
}

export default AppShell;