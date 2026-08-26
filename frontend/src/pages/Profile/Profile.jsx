import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/layout/AuthContext";

import UserProfile from "../../components/ProfilePopup"; 
import "./Profile.css"; 

import profileIcon from "../../assets/icons/user.png"
import logoutIcon from "../../assets/icons/logout.png";
 
function Profile() { 
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false); 

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
      await logout();
      navigate("/login", { replace: true });
  };

 
  return ( 
    <div className="profile-page"> 
 
      <div className="profile-page-header"> 
        <p>Manage your profile details</p> 
      </div> 
 
      <div className="profile-options"> 
 
        {/* Personal Details */} 
        {/* <div className="profile-option-card"> 
          <div className="profile-option-content"> 
            <h2>User Details</h2> 
            <p> 
              View and manage your information 
            </p> 
          </div> 
 
          <button 
            className="edit-profile-button" 
            onClick={() => setIsProfilePopupOpen(true)} 
          > 
            Edit Profile 
          </button> 
        </div>  */}
        <button
          type="button"
          className="profile-option-card"
          onClick={() => setIsProfilePopupOpen(true)}
        >
          <div className="card-link">
            <div className="action-left">
              <div className="card-icon inventory-icon-background">
                <img
                  src={profileIcon}
                  alt="Profile"
                />
              </div>
              <div className="card-text">
                <h2 className="card-title">
                  Profile Details
                </h2>
                <span className="card-subtitle">
                  Manage your profile details.
                </span>
              </div>
            </div>
            {/* <div className="card-arrow">
              <img
                src={chevronIcon}
                alt="Go to Inventory"
              />
            </div> */}
          </div>
        </button>
 
        {/* Business Details */}
        {/* <div className="profile-option-card"> 
          <div className="profile-option-content"> 
            <h2>Logout</h2> 
            <p> 
              Log out of your account.
            </p> 
          </div> 
 
          <button 
            className="logout-profile-button" 
          > 
            Logout
          </button> 
        </div> */}

        <button
          type="button"
          className="profile-option-card"
          onClick={handleLogout}
          
        >
          <div className="card-link">
            <div className="action-left">
              <div className="card-icon inventory-icon-background">
                <img
                  src={logoutIcon}
                  alt="Logout"
                />
              </div>
              <div className="card-text">
                <h2 className="card-title">
                  Logout
                </h2>
                <span className="card-subtitle">
                  Logout of your Account.
                </span>
              </div>
            </div>
            {/* <div className="card-arrow">
              <img
                src={chevronIcon}
                alt="Go to Inventory"
              />
            </div> */}
          </div>
        </button> 
 
      </div>  

      
 
      {/* Popup */} 
      <UserProfile 
        isOpen={isProfilePopupOpen} 
        onClose={() => setIsProfilePopupOpen(false)} 
      /> 
 
    </div> 
  ); 
} 
 
export default Profile;