import { useNavigate } from "react-router-dom";

import menuIcon from "../assets/icons/menu.png";
import dashboardIcon from "../assets/icons/dashboard.png";
import boxIcon from "../assets/icons/box.png";
import billIcon from "../assets/icons/bill.png";
import userIcon from "../assets/icons/user.png";

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar-desktop" id="sidebar">

      <div className="nav-item">
        <button type="button">
          <div className="nav-icon">
            <img src={menuIcon} alt="Menu" />
          </div>

          <div className="nav-label">
            Menu
          </div>
        </button>
      </div>

      <div className="nav-item">
        <button
          className="dashboard-active"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <div className="nav-icon">
            <img src={dashboardIcon} alt="Dashboard" />
          </div>

          <div className="nav-label">
            Dashboard
          </div>
        </button>
      </div>

      <div className="nav-item">
        <button
          className="inventory"
          type="button"
          onClick={() => navigate("/inventory")}
        >
          <div className="nav-icon">
            <img src={boxIcon} alt="Inventory" />
          </div>

          <div className="nav-label">
            Inventory
          </div>
        </button>
      </div>

      <div className="nav-item">
        <button
          className="billing"
          type="button"
          onClick={() => navigate("/billing")}
        >
          <div className="nav-icon">
            <img src={billIcon} alt="Billing" />
          </div>

          <div className="nav-label">
            Billing
          </div>
        </button>
      </div>

      <div className="nav-item">
        <button
          className="profile"
          type="button"
        >
          <div className="nav-icon">
            <img src={userIcon} alt="Profile" />
          </div>

          <div className="nav-label">
            Profile
          </div>
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;