import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/layout/AuthContext";
import "./Login.css";

// If you have the real image, put it at: src/assets/storeicon.png
// and swap this back to: import storeIcon from "../../assets/storeicon.png";
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

  const { login, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showStorePopup, setShowStorePopup] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [storeId, setStoreId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [location, setLocation] = useState("");

  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  const [popupFeedback, setPopupFeedback] = useState({
    type: "",
    text: "",
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setFeedback({ type: "", text: "" });
  };

  const handleLogin = async () => {
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

  const handleOpenStorePopup = () => {
    setFeedback({ type: "", text: "" });

    if (!firstName.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your first name.",
      });
      return;
    }

    if (!lastName.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your last name.",
      });
      return;
    }

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

    setPopupFeedback({
      type: "",
      text: "",
    });

    setShowStorePopup(true);
  };

  const handleCloseStorePopup = () => {
    if (isLoading) return;

    setShowStorePopup(false);

    setPopupFeedback({
      type: "",
      text: "",
    });
  };

  const handleCreateAccount = async () => {
    setPopupFeedback({
      type: "",
      text: "",
    });

    if (!storeId.trim()) {
      setPopupFeedback({
        type: "error",
        text: "Please enter your store ID.",
      });
      return;
    }

    if (!roleId.trim()) {
      setPopupFeedback({
        type: "error",
        text: "Please enter your role ID.",
      });
      return;
    }

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

    /*
      Signup API payload:

      {
        firstname: firstName,
        lastname: lastName,
        email: email,
        password: password,
        store_id: storeId,
        role_id: roleId,
        store_name: storeName,
        gst_no: gstNumber,
        location: location
      }
    */

    setPopupFeedback({
      type: "success",
      text: "Store details validated successfully.",
    });
  };

  return (
    <main className="login-signup-page">
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

      <div className="auth-card">
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
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

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

          {feedback.text && (
            <div
              className={`auth-feedback ${feedback.type}`}
            >
              {feedback.text}
            </div>
          )}

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

            <span className="auth-submit-arrow">→</span>
          </button>
        </form>
      </div>

      {showStorePopup && (
        <div
          className="store-popup-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
            <div className="store-popup-header">
              <div>
                <h2>Store Details</h2>

                <p>
                  Enter your store information to continue.
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

            <div
              className="store-popup-form"
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
              }}
            >
              <div className="popup-input-wrap">
                <label>Store ID</label>

                <input
                  type="text"
                  value={storeId}
                  onChange={(event) =>
                    setStoreId(event.target.value)
                  }
                  placeholder="Enter store ID"
                  disabled={isLoading}
                />
              </div>

              <div className="popup-input-wrap">
                <label>Role ID</label>

                <input
                  type="text"
                  value={roleId}
                  onChange={(event) =>
                    setRoleId(event.target.value)
                  }
                  placeholder="Enter role ID"
                  disabled={isLoading}
                />
              </div>

              <div className="popup-input-wrap">
                <label>Store Name</label>

                <input
                  type="text"
                  value={storeName}
                  onChange={(event) =>
                    setStoreName(event.target.value)
                  }
                  placeholder="Enter store name"
                  disabled={isLoading}
                />
              </div>

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

              <div className="popup-input-wrap">
                <label>Location</label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="Enter store location"
                  disabled={isLoading}
                />
              </div>

              {popupFeedback.text && (
                <div
                  className={`auth-feedback ${popupFeedback.type}`}
                >
                  {popupFeedback.text}
                </div>
              )}

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
          </div>
        </div>
      )}
    </main>
  );
}