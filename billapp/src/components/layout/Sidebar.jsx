import { NavLink } from "react-router-dom";

import dashboardIcon from "../../assets/icons/dashboard.png";
import boxIcon from "../../assets/icons/box.png";
import billIcon from "../../assets/icons/bill.png";
import userIcon from "../../assets/icons/user.png";

function Sidebar({ isOpen }) {
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
    {
      id: 4,
      path: "/profile",
      label: "Profile",
      icon: userIcon,
    },
  ];

  return (
    <aside
      className={`sidebar-desktop ${
        isOpen ? "sidebar-open" : "sidebar-closed"
      }`}
      id="sidebar"
    >

      {routes.map((route) => (
        <div className="nav-item" key={route.id}>

          <NavLink
            to={route.path}
            className={({ isActive }) =>
              isActive
                ? "sidebar-link active"
                : "sidebar-link"
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

    </aside>
  );
}

export default Sidebar;