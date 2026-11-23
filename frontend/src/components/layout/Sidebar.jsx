import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

import { getSignupRoles } from "../../services/authService";
import { useAuth } from "./AuthContext";

import dashboardIcon from "../../assets/icons/dashboard.png";
import boxIcon from "../../assets/icons/box.png";
import billIcon from "../../assets/icons/bill.png";
import userIcon from "../../assets/icons/user.png";
import historyIcon from "../../assets/icons/history.png";
import billIconSales from "../../assets/icons/bill.png";

function Sidebar({ isOpen , onProfileClick}) {
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOwnerStatus = async () => {
      try {
        const roles = await getSignupRoles();
        const ownerRole = roles.find(
          (role) =>
            String(role.role_name).toUpperCase() === "OWNER"
        );

        if (active) {
          setIsOwner(
            Boolean(
              ownerRole &&
              Number(ownerRole.role_id) ===
                Number(user?.roleId)
            )
          );
        }
      } catch {
        if (active) {
          setIsOwner(false);
        }
      }
    };

    if (user?.roleId) {
      loadOwnerStatus();
    }

    return () => {
      active = false;
    };
  }, [user?.roleId]);

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
    {
        id: 5,
        path: "/billhistory",
        label: "Bill History",
        icon: historyIcon,
      },
    {
      id: 6,
      path: "/sales",
      label: "Sales",
      icon: billIconSales,
      ownerOnly: true,
    },
  ];

  const visibleRoutes = routes.filter(
    (route) => !route.ownerOnly || isOwner
  );

  return (
    <aside
      className={`sidebar-desktop ${
        isOpen ? "sidebar-open" : "sidebar-closed"
      }`}
      id="sidebar"
    >

      {visibleRoutes.map((route) => (
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

      {/* <div className="nav-item">
        <button type="button" className="sidebar-link" onClick={onProfileClick}>
          <div className="nav-icon"><img src={userIcon} alt="Profile" /></div>
          <div className="nav-label">Profile</div>
        </button>
      </div> */}

    </aside>
  );
}

export default Sidebar;