
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/layout/AuthContext";
import "./Login.css";

const OWNER_ROLE_ID = "1";

const StoreIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="32"
    height="32"
    fill="currentColor"
  >
    <path d="M3 3h18l-1.5 6H4.5L3 3zm1.5 8h15l-1 8.5c-.06.5-.5.9-1 .9H6.5c-.5 0-.94-.4-1-.9L4.5 11zm3 2v5h2v-5h-2zm4 0v5h2v-5h-2z" />
  </svg>
);

export default function Login() {
  const navigate = useNavigate();

  const { login, signup, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("login");

  // ============================================================
  // LOGIN
  // ============================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ============================================================
  // SIGNUP
  // ============================================================

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [roleId, setRoleId] = useState("");

  // ============================================================
  // OWNER STORE DETAILS
  // ============================================================

  const [storeName, setStoreName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [location, setLocation] = useState("");

  // ============================================================
  // STAFF STORE SEARCH
  // ============================================================

  const [storeSearch, setStoreSearch] = useState("");
  const [storeResults, setStoreResults] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isSearchingStores, setIsSearchingStores] = useState(false);

  // ============================================================
  // POPUP
  // ============================================================

  const [showStorePopup, setShowStorePopup] = useState(false);

  // ============================================================
  // FEEDBACK
  // ============================================================

  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  const [popupFeedback, setPopupFeedback] = useState({
    type: "",
    text: "",
  });

  // ============================================================
  // TAB CHANGE
  // ============================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setEmail("");
    setPassword("");
    setShowPassword(false);

    setFeedback({
      type: "",
      text: "",
    });

    setPopupFeedback({
      type: "",
      text: "",
    });

    setRoleId("");

    setStoreName("");
    setGstNumber("");
    setLocation("");

    setStoreSearch("");
    setStoreResults([]);
    setSelectedStore(null);

    setShowStorePopup(false);
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async () => {
    setFeedback({
      type: "",
      text: "",
    });

    if (!email.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your email.",
      });
      return;
    }

    if (!password) {
      setFeedback({
        type: "error",
        text: "Please enter your password.",
      });
      return;
    }

    try {
      await login(email.trim(), password);

      navigate("/dashboard");
    } catch (error) {
      setFeedback({
        type: "error",
        text: error.message || "Unable to log in.",
      });
    }
  };

  // ============================================================
  // VALIDATE BASIC SIGNUP DETAILS
  // ============================================================

  const validateSignupDetails = () => {
    setFeedback({
      type: "",
      text: "",
    });

    if (!firstName.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your first name.",
      });
      return false;
    }

    if (!lastName.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your last name.",
      });
      return false;
    }

    if (!email.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your email.",
      });
      return false;
    }

    if (!password) {
      setFeedback({
        type: "error",
        text: "Please enter your password.",
      });
      return false;
    }

    if (!roleId) {
      setFeedback({
        type: "error",
        text: "Please select your role.",
      });
      return false;
    }

    return true;
  };

  // ============================================================
  // OPEN OWNER / STAFF POPUP
  // ============================================================

  const handleOpenStorePopup = () => {
    if (!validateSignupDetails()) {
      return;
    }

    setPopupFeedback({
      type: "",
      text: "",
    });

    setStoreSearch("");
    setStoreResults([]);
    setSelectedStore(null);

    setShowStorePopup(true);
  };

  // ============================================================
  // CLOSE POPUP
  // ============================================================

  const handleCloseStorePopup = () => {
    if (isLoading) {
      return;
    }

    setShowStorePopup(false);

    setPopupFeedback({
      type: "",
      text: "",
    });

    setStoreSearch("");
    setStoreResults([]);
    setSelectedStore(null);
  };

  // ============================================================
  // SEARCH EXISTING STORES
  // STAFF ONLY
  // ============================================================

  const searchStores = async () => {
    setPopupFeedback({
      type: "",
      text: "",
    });

    if (!storeSearch.trim()) {
      setPopupFeedback({
        type: "error",
        text: "Enter a Store ID or Store Name to search.",
      });
      return;
    }

    try {
      setIsSearchingStores(true);

      setSelectedStore(null);

      /*
       * CHANGE THIS URL if your backend uses a different route.
       *
       * Example expected:
       * GET /api/stores/search?query=abc
       */

      const response = await fetch(
        `/api/stores/search?query=${encodeURIComponent(
          storeSearch.trim()
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to search stores."
        );
      }

      /*
       * Supports:
       *
       * [
       *   { store_id: 1, store_name: "ABC Store", location: "..." }
       * ]
       *
       * OR:
       *
       * { stores: [...] }
       */

      const stores = Array.isArray(data)
        ? data
        : Array.isArray(data.stores)
        ? data.stores
        : [];

      setStoreResults(stores);

      if (stores.length === 0) {
        setPopupFeedback({
          type: "error",
          text: "No stores found. Try another Store ID or Store Name.",
        });
      }
    } catch (error) {
      setStoreResults([]);

      setPopupFeedback({
        type: "error",
        text:
          error.message ||
          "Unable to search stores. Please try again.",
      });
    } finally {
      setIsSearchingStores(false);
    }
  };

  // ============================================================
  // SELECT STAFF STORE
  // ============================================================

  const handleSelectStore = (store) => {
    setSelectedStore(store);

    setPopupFeedback({
      type: "",
      text: "",
    });
  };

  // ============================================================
  // CREATE ACCOUNT
  // ============================================================

  const handleCreateAccount = async () => {
    setPopupFeedback({
      type: "",
      text: "",
    });

    // ==========================================================
    // OWNER
    // ==========================================================

    if (roleId === OWNER_ROLE_ID) {
      if (!storeName.trim()) {
        setPopupFeedback({
          type: "error",
          text: "Please enter your store name.",
        });
        return;
      }

      if (!gstNumber.trim()) {
        setPopupFeedback({
          type: "error",
          text: "Please enter your GST number.",
        });
        return;
      }

      if (!location.trim()) {
        setPopupFeedback({
          type: "error",
          text: "Please enter your store location.",
        });
        return;
      }

      try {
        await signup({
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          email: email.trim(),
          password,

          role_id: roleId,

          // Owner creates a new store
          store_id: "",

          store_name: storeName.trim(),
          gst_no: gstNumber.trim(),
          location: location.trim(),
        });

        setShowStorePopup(false);

        navigate("/dashboard");
      } catch (error) {
        setPopupFeedback({
          type: "error",
          text:
            error.message ||
            "Unable to create owner account.",
        });
      }

      return;
    }

    // ==========================================================
    // STAFF
    // ==========================================================

    if (!selectedStore) {
      setPopupFeedback({
        type: "error",
        text: "Please search and select a store to join.",
      });
      return;
    }

    try {
      await signup({
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        email: email.trim(),
        password,

        // Staff role
        role_id: roleId,

        // Selected existing store
        store_id:
          selectedStore.store_id ||
          selectedStore.id,

        // Staff does NOT create store details
        store_name: "",
        gst_no: "",
        location: "",
      });

      setShowStorePopup(false);

      navigate("/dashboard");
    } catch (error) {
      setPopupFeedback({
        type: "error",
        text:
          error.message ||
          "Unable to create staff account.",
      });
    }
  };

  // ============================================================
  // ROLE LABEL
  // ============================================================

  const getRoleLabel = () => {
    if (roleId === OWNER_ROLE_ID) {
      return "Owner";
    }

    if (roleId) {
      return "Staff";
    }

    return "";
  };

  // ============================================================
  // JSX
  // ============================================================

  return (
    <main className="login-signup-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="auth-header-block">
        <div className="auth-icon-badge">
          <StoreIcon />
        </div>

        <h1>
          {activeTab === "login"
            ? "Welcome back"
            : "Create your account"}
        </h1>

        <p>
          {activeTab === "login"
            ? "Sign in to continue to your store"
            : "Sign up to get started with your store"}
        </p>
      </div>

      {/* ======================================================
          CARD
      ====================================================== */}

      <div className="auth-card">
        {/* ====================================================
            TABS
        ==================================================== */}

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${
              activeTab === "login" ? "active" : ""
            }`}
            onClick={() => handleTabChange("login")}
            disabled={isLoading}
          >
            Login
          </button>

          <button
            type="button"
            className={`auth-tab ${
              activeTab === "signup" ? "active" : ""
            }`}
            onClick={() => handleTabChange("signup")}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>

        {/* ====================================================
            FORM
        ==================================================== */}

        <form
          onSubmit={(event) => {
            event.preventDefault();

            if (activeTab === "login") {
              handleLogin();
            } else {
              handleOpenStorePopup();
            }
          }}
        >
          {/* ==================================================
              SIGNUP NAME
          ================================================== */}

          {activeTab === "signup" && (
            <div className="auth-name-row">
              <div className="auth-input-wrap">
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  placeholder="First name"
                  disabled={isLoading}
                />
              </div>

              <div className="auth-input-wrap">
                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  placeholder="Last name"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div className="auth-input-wrap">
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Email address"
              disabled={isLoading}
            />
          </div>

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <div className="auth-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Password"
              disabled={isLoading}
            />

            <button
              type="button"
              className="auth-eye-toggle"
              onClick={() =>
                setShowPassword((value) => !value)
              }
              disabled={isLoading}
            >
              {showPassword ? "$" : "S"}
            </button>
          </div>

          {/* ==================================================
              ROLE
          ================================================== */}

          {activeTab === "signup" && (
            <div className="auth-input-wrap">
              <select
                value={roleId}
                onChange={(event) => {
                  setRoleId(event.target.value);

                  setFeedback({
                    type: "",
                    text: "",
                  });
                }}
                disabled={isLoading}
              >
                <option value="">
                  Select your role
                </option>

                <option value="1">
                  Owner
                </option>

                <option value="2">
                  Staff
                </option>
              </select>
            </div>
          )}

          {/* ==================================================
              LOGIN OPTIONS
          ================================================== */}

          {activeTab === "login" && (
            <div className="auth-label-row">
              <label className="auth-checkbox-row">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="auth-forgot-link"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* ==================================================
              FEEDBACK
          ================================================== */}

          {feedback.text && (
            <div
              className={`auth-feedback ${feedback.type}`}
            >
              {feedback.text}
            </div>
          )}

          {/* ==================================================
              SUBMIT
          ================================================== */}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Please wait..."
              : activeTab === "login"
              ? "Login"
              : "Continue"}

            <span className="auth-submit-arrow">
              →
            </span>
          </button>
        </form>
      </div>

      {/* ======================================================
          OWNER / STAFF POPUP
      ====================================================== */}

      {showStorePopup && (
        <div
          className="store-popup-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              handleCloseStorePopup();
            }
          }}
        >
          <div
            className="store-popup"
            style={{
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* ==================================================
                POPUP HEADER
            ================================================== */}

            <div className="store-popup-header">
              <div>
                <h2>
                  {roleId === OWNER_ROLE_ID
                    ? "Create Your Store"
                    : "Join a Store"}
                </h2>

                <p>
                  {roleId === OWNER_ROLE_ID
                    ? "Enter your store details to create a new store."
                    : "Search for an existing store and select it to join."}
                </p>
              </div>

              <button
                type="button"
                className="store-popup-close"
                onClick={handleCloseStorePopup}
                disabled={isLoading}
              >
                ×
              </button>
            </div>

            {/* ==================================================
                OWNER POPUP
            ================================================== */}

            {roleId === OWNER_ROLE_ID && (
              <div
                className="store-popup-form"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                {/* ROLE */}

                <div className="popup-input-wrap">
                  <label>Role</label>

                  <input
                    type="text"
                    value="Owner"
                    disabled
                  />
                </div>

                {/* STORE NAME */}

                <div className="popup-input-wrap">
                  <label>Store Name</label>

                  <input
                    type="text"
                    value={storeName}
                    onChange={(event) =>
                      setStoreName(
                        event.target.value
                      )
                    }
                    placeholder="Enter store name"
                    disabled={isLoading}
                  />
                </div>

                {/* GST */}

                <div className="popup-input-wrap">
                  <label>GST Number</label>

                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(event) =>
                      setGstNumber(
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="Enter GST number"
                    disabled={isLoading}
                  />
                </div>

                {/* LOCATION */}

                <div className="popup-input-wrap">
                  <label>Store Location</label>

                  <input
                    type="text"
                    value={location}
                    onChange={(event) =>
                      setLocation(
                        event.target.value
                      )
                    }
                    placeholder="Enter store location"
                    disabled={isLoading}
                  />
                </div>

                {/* FEEDBACK */}

                {popupFeedback.text && (
                  <div
                    className={`auth-feedback ${popupFeedback.type}`}
                  >
                    {popupFeedback.text}
                  </div>
                )}

                {/* ACTIONS */}

                <div className="store-popup-actions">
                  <button
                    type="button"
                    className="popup-cancel-button"
                    onClick={handleCloseStorePopup}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="popup-create-button"
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Creating..."
                      : "Create Account"}
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================
                STAFF POPUP
            ================================================== */}

            {roleId !== OWNER_ROLE_ID && (
              <div
                className="store-popup-form"
                style={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                {/* ROLE */}

                <div className="popup-input-wrap">
                  <label>Role</label>

                  <input
                    type="text"
                    value={getRoleLabel() || "Staff"}
                    disabled
                  />
                </div>

                {/* SEARCH */}

                <div className="popup-input-wrap">
                  <label>
                    Search Existing Store
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="text"
                      value={storeSearch}
                      onChange={(event) =>
                        setStoreSearch(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          event.preventDefault();
                          searchStores();
                        }
                      }}
                      placeholder="Search by Store ID or Store Name"
                      disabled={
                        isLoading ||
                        isSearchingStores
                      }
                    />

                    <button
                      type="button"
                      className="popup-create-button"
                      onClick={searchStores}
                      disabled={
                        isLoading ||
                        isSearchingStores
                      }
                    >
                      {isSearchingStores
                        ? "Searching..."
                        : "Search"}
                    </button>
                  </div>
                </div>

                {/* ==================================================
                    SEARCH RESULTS
                ================================================== */}

                {storeResults.length > 0 && (
                  <div
                    className="store-search-results"
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    <label>
                      Select Store
                    </label>

                    {storeResults.map(
                      (store, index) => {
                        const currentStoreId =
                          store.store_id ||
                          store.id;

                        const isSelected =
                          selectedStore &&
                          (
                            selectedStore.store_id ||
                            selectedStore.id
                          ) === currentStoreId;

                        return (
                          <button
                            type="button"
                            key={
                              currentStoreId ||
                              index
                            }
                            onClick={() =>
                              handleSelectStore(
                                store
                              )
                            }
                            disabled={isLoading}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              marginTop: "8px",
                              padding: "12px",
                              border:
                                isSelected
                                  ? "2px solid #008f6b"
                                  : "1px solid #ddd",
                              borderRadius:
                                "8px",
                              background:
                                isSelected
                                  ? "#f0faf7"
                                  : "#fff",
                              cursor:
                                "pointer",
                            }}
                          >
                            <strong>
                              {store.store_name ||
                                store.name ||
                                "Unnamed Store"}
                            </strong>

                            <br />

                            <span>
                              Store ID:{" "}
                              {currentStoreId}
                            </span>

                            {store.location && (
                              <>
                                <br />

                                <span>
                                  Location:{" "}
                                  {
                                    store.location
                                  }
                                </span>
                              </>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

                {/* ==================================================
                    SELECTED STORE
                ================================================== */}

                {selectedStore && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "12px",
                      borderRadius: "8px",
                      background: "#f0faf7",
                      border:
                        "1px solid #008f6b",
                    }}
                  >
                    <strong>
                      Selected Store
                    </strong>

                    <p
                      style={{
                        margin:
                          "6px 0 0",
                      }}
                    >
                      {
                        selectedStore.store_name ||
                        selectedStore.name
                      }
                    </p>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                      }}
                    >
                      Store ID:{" "}
                      {
                        selectedStore.store_id ||
                        selectedStore.id
                      }
                    </p>

                    {selectedStore.location && (
                      <p
                        style={{
                          margin:
                            "4px 0 0",
                        }}
                      >
                        Location:{" "}
                        {
                          selectedStore.location
                        }
                      </p>
                    )}
                  </div>
                )}

                {/* ==================================================
                    FEEDBACK
                ================================================== */}

                {popupFeedback.text && (
                  <div
                    className={`auth-feedback ${popupFeedback.type}`}
                    style={{
                      marginTop: "15px",
                    }}
                  >
                    {popupFeedback.text}
                  </div>
                )}

                {/* ==================================================
                    ACTIONS
                ================================================== */}

                <div className="store-popup-actions">
                  <button
                    type="button"
                    className="popup-cancel-button"
                    onClick={handleCloseStorePopup}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="popup-create-button"
                    onClick={handleCreateAccount}
                    disabled={
                      isLoading ||
                      !selectedStore
                    }
                  >
                    {isLoading
                      ? "Joining..."
                      : "Join Store"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

