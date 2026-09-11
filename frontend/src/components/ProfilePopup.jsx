import React, { useEffect, useState } from "react";

import "../pages/Voicebilling/Voicebilling.css";
import "../components/ProfilePopup.css"

import { useAuth } from "./layout/AuthContext";
import * as storeService from "../services/storeService";

function UserProfile({ isOpen, onClose }) {
  const { user, updateProfile } = useAuth();

  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [gstID, setGstID] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    setUserFirstName(user.firstname || "");
    setUserLastName(user.lastname || "");
    setUserEmail(user.email || "");

    storeService
      .getCurrentStore()
      .then((storeData) => {
        setStore(storeData);
        setGstID(storeData?.gst_no || "");
      })
      .catch((error) => {
        console.error("Failed to load store details:", error);
      });
  }, [isOpen, user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!userFirstName.trim()) {
      alert("First name is required.");
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        firstname: userFirstName.trim(),
        lastname: userLastName.trim(),
        email: userEmail.trim(),
      });

      if (store && gstID.trim() && gstID.trim() !== store.gst_no) {
        try {
          await storeService.updateCurrentStore({ gst_no: gstID.trim() });
        } catch (error) {
          // Only OWNER accounts may update store GST — surface but don't
          // block the rest of the profile update.
          alert(error.message || "Failed to update store GST number.");
        }
      }

      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(error.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
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
            placeholder="Store GST Number"
            value={gstID}
            onChange={(event) => setGstID(event.target.value)}
          />
          <div className="popup-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={isSaving}>
              {isSaving ? "Saving..." : "Edit Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;
