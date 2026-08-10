import { useNavigate } from "react-router-dom";

import dashboardIcon from "../assets/icons/dashboard.png";
import boxIcon from "../assets/icons/box.png";
import billIcon from "../assets/icons/bill.png";
import userIcon from "../assets/icons/user.png";

function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav">

      <div className="nav-item">
        <button
          className="dashboard"
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

    </nav>
  );
}

export default BottomNav;