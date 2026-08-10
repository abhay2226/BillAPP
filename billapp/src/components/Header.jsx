import { useLocation } from "react-router-dom";
import leftIcon from "../assets/icons/left.png";
import addIcon from "../assets/icons/add (2).png";

const routeTitles = {
  "/billing": "Voice Billing",
  "/inventory": "Inventory",
  "/dashboard": "Dashboard",
  // add other routes here
};

function Header({ onBack, onAddProduct }) {
  const location = useLocation();
  const title = routeTitles[location.pathname];

  return (
    <header className="inventory_section">
      <div className="left_inventory_section">
        <button
          type="button"
          className="header-icon-button"
          onClick={onBack}
        >
          <img src={leftIcon} alt="Back" />
        </button>

        <h4>{title}</h4>
      </div>

      <div className="right_inventory_section">
        <button
          type="button"
          className="header-icon-button"
          onClick={onAddProduct}
        >
          <img src={addIcon} alt="Add Product" />
        </button>
      </div>
    </header>
  );
}

export default Header;