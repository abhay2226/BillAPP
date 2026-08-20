import { useLocation } from "react-router-dom";

import menuIcon from "../../assets/icons/menu.png";
// import addIcon from "../../assets/icons/add (2).png";
import storeIcon from "../../assets/icons/store.png";

import "./AppShell.css";

const routeTitles = {
  "/billing": "Voice Billing",
  "/inventory": "Inventory",
  "/dashboard": "Dashboard",
  "/profile" : "Profile",
};

function Header({ onMenuToggle, onAddProduct , isAuthPage }) {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "ProShop";

  if (isAuthPage) {
    return (
        <header className="inventory_section auth-header">
            <div className="auth-brand">
                <img src={storeIcon} alt="ProShop" className="auth-brand-icon" />
                <span className="auth-brand-text"><strong>PRO</strong><b>SHOP</b></span>
            </div>
        </header>
    );
  }
  return (
    <header className="inventory_section">

      <div className="left_inventory_section">

        {/* MENU TOGGLE */}
        <button
          type="button"
          className="header-icon-button"
          onClick={onMenuToggle}
        >
          <img src={menuIcon} alt="Menu" />
        </button>

        <h4>{title}</h4>

      </div>

      <div className="right_inventory_section">

        {/* <button
          type="button"
          className="header-icon-button"
          onClick={onAddProduct}
        >
          <img src={addIcon} alt="Add Product" />
        </button> */}
{/* 
        {onAddProduct && (
          <button
            type="button"
            className="header-icon-button"
            onClick={onAddProduct}
          >
            <img
              src={addIcon}
              alt="Add Product"
            />
          </button>
        )} */}

      </div>

    </header>
  );
}

export default Header;