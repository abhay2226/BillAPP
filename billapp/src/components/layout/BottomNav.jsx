import { NavLink } from "react-router-dom";

import dashboardIcon from "../../assets/icons/dashboard.png";
import boxIcon from "../../assets/icons/box.png";
import billIcon from "../../assets/icons/bill.png";
import userIcon from "../../assets/icons/user.png";

function BottomNav({onProfileClick}) {
  const routes = [
      {
        id: 1,
        path: "/dashboard",
        label: "Dashboard",
        icon: dashboardIcon,
      },
      {
        id: 2,
        path: "/inventory",
        label: "Inventory",
        icon: boxIcon,
      },
      {
        id: 3,
        path: "/billing",
        label: "Billing",
        icon: billIcon,
      },
      // {
      //   id: 4,
      //   path: "",
      //   label: "Profile",
      //   icon: userIcon,
      // },
    ];
  // const navigate = useNavigate();

  return (
    <nav className="bottom-nav" id="nav">

      {/* <div className="nav-item">
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
          onClick={onProfileClick}>
          <div className="nav-icon">
            <img src={userIcon} alt="Profile" />
          </div>

          <div className="nav-label">
            Profile
          </div>
        </button>
      </div> */}

      {routes.map((route) => (
        <div className="nav-item" key={route.id}>

          <NavLink
            to={route.path}
            className={({ isActive }) =>
              isActive
                ? "nav-link active"
                : "nav-link"
            }
          >

            <div className="nav-icon">
              <img
                src={route.icon}
                alt={route.label}
              />
            </div>

            <div className="nav-label">
              {route.label}
            </div>

          </NavLink>

        </div>
      ))}

      <div className="nav-item">
        <button type="button" className="nav-link" onClick={onProfileClick}>
          <div className="nav-icon"><img src={userIcon} alt="Profile" /></div>
          <div className="nav-label">Profile</div>
        </button>
      </div>


    </nav>
  );
}

export default BottomNav;