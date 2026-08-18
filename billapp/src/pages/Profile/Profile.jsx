import React, { useState } from "react"; 
import UserProfile from "../../components/ProfilePopup"; 
import "./Profile.css"; 
 
function Profile() { 
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false); 
 
  return ( 
    <div className="profile-page"> 
 
      <div className="profile-page-header"> 
        <h1>Profile</h1> 
        <p>Manage your profile details</p> 
      </div> 
 
      <div className="profile-options"> 
 
        {/* Personal Details */} 
        <div className="profile-option-card"> 
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
        </div> 
 
        {/* Business Details */} 
        <div className="profile-option-card"> 
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
        </div> 
 
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