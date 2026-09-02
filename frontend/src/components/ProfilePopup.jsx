import React, { useState } from "react";

import "../pages/Voicebilling/Voicebilling.css";
import "../components/ProfilePopup.css"

function UserProfile({ isOpen, onClose }) {
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userNumber, setUserNumber] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [gstID, setGstID] = useState("");

  const handleProfileSubmit = (event) => {
    event.preventDefault();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="billing-popup-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="pop-up">
        <h2>User Profile</h2>
        <form id="addUserForm" onSubmit={handleProfileSubmit}>
          <input
            type="text"
            placeholder="FirstName"
            value={userFirstName}
            onChange={(event) => setUserFirstName(event.target.value)}
            required
          />
          <input
            type="text"
            placeholder="LastName"
            value={userLastName}
            onChange={(event) => setUserLastName(event.target.value)}
            required
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength="10"
            placeholder="Phone Number"
            value={userNumber}
            onChange={(event) => setUserNumber(event.target.value)}
            required
          />
          <input
            type="email"
            inputMode="email"
            placeholder="E-mail"
            value={userEmail}
            onChange={(event) => setUserEmail(event.target.value)}
            required
          />
          <input
            type="text"
            placeholder="GstID"
            value={gstID}
            onChange={(event) => setGstID(event.target.value)}
            required
          />
          <div className="popup-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Edit Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;