import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/layout/AuthContext";
import { getSignupStores } from "./authService";
import "./Login.css";

const storeIcon = "/assets/store-icon.png";

export default function Login() {
  const navigate = useNavigate();

  const {
    login,
    signup,
    isLoading,
  } = useAuth();

  /* =========================================================
     LOGIN / SIGNUP
  ========================================================= */

  const [isSignUp, setIsSignUp] = useState(false);

  /* =========================================================
     USER DETAILS
  ========================================================= */

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* =========================================================
     SIGNUP TYPE
     
     newStore       -> OWNER
     existingStore  -> STAFF
  ========================================================= */

  const [signupType, setSignupType] = useState("newStore");

  /* =========================================================
     NEW STORE DETAILS
  ========================================================= */

  const [storeName, setStoreName] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [location, setLocation] = useState("");

  /* =========================================================
     EXISTING STORE
  ========================================================= */

  const [selectedStore, setSelectedStore] = useState(null);

  /* =========================================================
     STORE MODAL
  ========================================================= */

  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [storeSearch, setStoreSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);

  /* =========================================================
     UI
  ========================================================= */

  const [showPassword, setShowPassword] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });


  /* =========================================================
     LOAD STORES
     
     Only runs while the store modal is open.
     
     Debounced by 350ms so the API is not called for every
     individual keystroke.
  ========================================================= */

  useEffect(() => {
    if (!isStoreModalOpen) {
      return;
    }

    const timer = setTimeout(async () => {
      setStoresLoading(true);

      try {
        const data = await getSignupStores(storeSearch);

        setStores(Array.isArray(data) ? data : []);

      } catch (error) {
        setStores([]);

        setFeedback({
          type: "error",
          text:
            error.message ||
            "Unable to load available stores.",
        });
      } finally {
        setStoresLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isStoreModalOpen, storeSearch]);


  /* =========================================================
     OPEN STORE MODAL
  ========================================================= */

  const openStoreModal = () => {
    setStoreSearch("");

    setFeedback({
      type: "",
      text: "",
    });

    setIsStoreModalOpen(true);
  };


  /* =========================================================
     CLOSE STORE MODAL
  ========================================================= */

  const closeStoreModal = () => {
    setIsStoreModalOpen(false);
    setStoreSearch("");
  };


  /* =========================================================
     SELECT STORE
  ========================================================= */

  const handleStoreSelect = (store) => {
    setSelectedStore(store);

    setIsStoreModalOpen(false);
    setStoreSearch("");

    setFeedback({
      type: "",
      text: "",
    });
  };


  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFeedback({
      type: "",
      text: "",
    });


    /* =======================================================
       LOGIN
    ======================================================= */

    if (!isSignUp) {
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
        await login(
          email.trim(),
          password
        );

        navigate("/dashboard");

      } catch (error) {
        setFeedback({
          type: "error",
          text:
            error.message ||
            "Unable to log in.",
        });
      }

      return;
    }


    /* =======================================================
       SIGNUP VALIDATION
    ======================================================= */

    if (!firstname.trim()) {
      setFeedback({
        type: "error",
        text: "Please enter your first name.",
      });

      return;
    }

    if (!lastname.trim()) {
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
        text: "Please enter a password.",
      });

      return;
    }

    if (password !== confirmPassword) {
      setFeedback({
        type: "error",
        text: "Passwords do not match.",
      });

      return;
    }


    /* =======================================================
       CREATE NEW STORE
    ======================================================= */

    if (signupType === "newStore") {
      if (!storeName.trim()) {
        setFeedback({
          type: "error",
          text: "Please enter the store name.",
        });

        return;
      }

      if (!gstNo.trim()) {
        setFeedback({
          type: "error",
          text: "Please enter the GST number.",
        });

        return;
      }

      if (!location.trim()) {
        setFeedback({
          type: "error",
          text: "Please enter the store location.",
        });

        return;
      }

      try {
        await signup({
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          email: email.trim(),
          password,

          store_name: storeName.trim(),
          gst_no: gstNo.trim(),
          location: location.trim(),
        });

        navigate("/dashboard");

      } catch (error) {
        setFeedback({
          type: "error",
          text:
            error.message ||
            "Unable to create your account.",
        });
      }

      return;
    }


    /* =======================================================
       JOIN EXISTING STORE
    ======================================================= */

    if (!selectedStore) {
      setFeedback({
        type: "error",
        text: "Please select a store.",
      });

      return;
    }

    try {
      await signup({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        password,

        store_id: Number(
          selectedStore.storeId
        ),
      });

      navigate("/dashboard");

    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error.message ||
          "Unable to create your account.",
      });
    }
  };


  /* =========================================================
     SWITCH TO SIGNUP
  ========================================================= */

  const switchToSignup = () => {
    setIsSignUp(true);

    setFeedback({
      type: "",
      text: "",
    });
  };


  /* =========================================================
     SWITCH TO LOGIN
  ========================================================= */

  const switchToLogin = () => {
    setIsSignUp(false);

    setFeedback({
      type: "",
      text: "",
    });
  };


  /* =========================================================
     CHANGE SIGNUP TYPE
  ========================================================= */

  const selectNewStore = () => {
    setSignupType("newStore");

    setSelectedStore(null);

    setFeedback({
      type: "",
      text: "",
    });
  };


  const selectExistingStore = () => {
    setSignupType("existingStore");

    setStoreName("");
    setGstNo("");
    setLocation("");

    setFeedback({
      type: "",
      text: "",
    });
  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="login-signup-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="auth-header-block">

        <div className="auth-icon-badge">
          <img
            src={storeIcon}
            alt=""
          />
        </div>

        <h1>
          {isSignUp
            ? "Create your account"
            : "Welcome back"}
        </h1>

        <p>
          {isSignUp
            ? "Create your account to manage your store"
            : "Sign in to continue to your store"}
        </p>

      </div>


      {/* =====================================================
          CARD
      ===================================================== */}

      <div className="auth-card">

        <form onSubmit={handleSubmit}>

          {/* =================================================
              SIGNUP USER DETAILS
          ================================================= */}

          {isSignUp && (
            <>

              <div className="auth-input-wrap">
                <input
                  type="text"
                  value={firstname}
                  onChange={(event) =>
                    setFirstname(event.target.value)
                  }
                  placeholder="First name"
                  disabled={isLoading}
                />
              </div>


              <div className="auth-input-wrap">
                <input
                  type="text"
                  value={lastname}
                  onChange={(event) =>
                    setLastname(event.target.value)
                  }
                  placeholder="Last name"
                  disabled={isLoading}
                />
              </div>


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
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
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
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={isLoading}
                >
                  <img
                    src=""
                    alt=""
                  />
                </button>

              </div>


              <div className="auth-input-wrap">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Confirm password"
                  disabled={isLoading}
                />

              </div>


              {/* =============================================
                  ACCOUNT TYPE
              ============================================= */}

              <div className="signup-type-section">

                <label>
                  Account type
                </label>

                <div className="signup-type-options">

                  <button
                    type="button"
                    className={
                      signupType === "newStore"
                        ? "signup-type-card active"
                        : "signup-type-card"
                    }
                    onClick={selectNewStore}
                    disabled={isLoading}
                  >

                    <div className="signup-type-radio">
                      {signupType === "newStore"
                        ? "✓"
                        : ""}
                    </div>

                    <div className="signup-type-content">

                      <strong>
                        Create new store
                      </strong>

                      <small>
                        Create a store as owner
                      </small>

                    </div>

                  </button>


                  <button
                    type="button"
                    className={
                      signupType === "existingStore"
                        ? "signup-type-card active"
                        : "signup-type-card"
                    }
                    onClick={selectExistingStore}
                    disabled={isLoading}
                  >

                    <div className="signup-type-radio">
                      {signupType ===
                      "existingStore"
                        ? "✓"
                        : ""}
                    </div>

                    <div className="signup-type-content">

                      <strong>
                        Join existing store
                      </strong>

                      <small>
                        Join a store as staff
                      </small>

                    </div>

                  </button>

                </div>

              </div>


              {/* =============================================
                  NEW STORE
              ============================================= */}

              {signupType === "newStore" && (
                <div className="signup-details">

                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      value={storeName}
                      onChange={(event) =>
                        setStoreName(
                          event.target.value
                        )
                      }
                      placeholder="Store name"
                      disabled={isLoading}
                    />
                  </div>


                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      value={gstNo}
                      onChange={(event) =>
                        setGstNo(
                          event.target.value
                        )
                      }
                      placeholder="GST number"
                      disabled={isLoading}
                    />
                  </div>


                  <div className="auth-input-wrap">
                    <input
                      type="text"
                      value={location}
                      onChange={(event) =>
                        setLocation(
                          event.target.value
                        )
                      }
                      placeholder="Store location"
                      disabled={isLoading}
                    />
                  </div>

                </div>
              )}


              {/* =============================================
                  EXISTING STORE
              ============================================= */}

              {signupType === "existingStore" && (
                <div className="signup-details">

                  <label>
                    Store
                  </label>

                  <button
                    type="button"
                    className={
                      selectedStore
                        ? "store-select-button selected"
                        : "store-select-button"
                    }
                    onClick={openStoreModal}
                    disabled={isLoading}
                  >

                    {selectedStore ? (
                      <div className="store-select-info">

                        <strong>
                          {selectedStore.storeName}
                        </strong>

                        <small>
                          {selectedStore.location}
                        </small>

                        {selectedStore.ownerName && (
                          <small>
                            Owner:{" "}
                            {selectedStore.ownerName}
                          </small>
                        )}

                      </div>
                    ) : (
                      <div className="store-select-placeholder">
                        Select a store
                      </div>
                    )}

                  </button>

                </div>
              )}

            </>
          )}


          {/* =================================================
              LOGIN
          ================================================= */}

          {!isSignUp && (
            <>

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
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
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
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  disabled={isLoading}
                >
                  <img
                    src=""
                    alt=""
                  />
                </button>

              </div>


              <div className="auth-label-row">

                <label className="auth-checkbox-row">

                  <input
                    type="checkbox"
                  />

                  Remember me

                </label>


                <button
                  type="button"
                  className="auth-forgot-link"
                >
                  Forgot password?
                </button>

              </div>

            </>
          )}


          {/* =================================================
              FEEDBACK
          ================================================= */}

          {feedback.text && (
            <div
              className={`auth-feedback ${feedback.type}`}
            >
              {feedback.text}
            </div>
          )}


          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="auth-submit"
            disabled={isLoading}
          >

            {isLoading
              ? "Please wait..."
              : isSignUp
                ? "Create account"
                : "Login"}

            <img
              className="auth-submit-arrow"
              src=""
              alt=""
            />

          </button>

        </form>


        {/* ===================================================
            LOGIN / SIGNUP SWITCH
        =================================================== */}

        <div className="auth-switch-text">

          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            className="auth-switch"
            onClick={
              isSignUp
                ? switchToLogin
                : switchToSignup
            }
          >
            {isSignUp
              ? "Login"
              : "Sign up"}
          </button>

        </div>

      </div>


      {/* =====================================================
          STORE SELECTION MODAL
      ===================================================== */}

      {isStoreModalOpen && (
        <div
          className="store-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeStoreModal();
            }
          }}
        >

          <div className="store-modal">

            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div className="store-modal-header">

              <div>
                <h2>
                  Select Store
                </h2>

                <p>
                  Search by store name, owner or location
                </p>
              </div>

              <button
                type="button"
                className="store-modal-close"
                onClick={closeStoreModal}
                disabled={storesLoading}
              >
                <img
                  src=""
                  alt=""
                />
              </button>

            </div>


            {/* ===============================================
                SEARCH
            =============================================== */}

            <div className="auth-input-wrap store-modal-search">

              <input
                type="text"
                value={storeSearch}
                onChange={(event) =>
                  setStoreSearch(
                    event.target.value
                  )
                }
                placeholder="Search store, owner or location..."
                autoFocus
                disabled={false}
              />

            </div>


            {/* ===============================================
                RESULTS
            =============================================== */}

            <div className="store-modal-results">

              {storesLoading && (
                <div className="store-loading">
                  Loading stores...
                </div>
              )}


              {!storesLoading &&
                stores.length === 0 && (
                  <div className="store-empty">

                    {storeSearch.trim()
                      ? "No matching stores found."
                      : "No stores available."}

                  </div>
                )}


              {!storesLoading &&
                stores.map((store) => (

                  <button
                    type="button"
                    key={store.storeId}
                    className={
                      selectedStore &&
                      Number(
                        selectedStore.storeId
                      ) ===
                        Number(
                          store.storeId
                        )
                        ? "store-option selected"
                        : "store-option"
                    }
                    onClick={() =>
                      handleStoreSelect(
                        store
                      )
                    }
                  >

                    <div className="store-option-info">

                      <strong>
                        {store.storeName}
                      </strong>

                      {store.location && (
                        <small>
                          {store.location}
                        </small>
                      )}

                      {store.ownerName && (
                        <small>
                          Owner:{" "}
                          {store.ownerName}
                        </small>
                      )}

                    </div>


                    {selectedStore &&
                      Number(
                        selectedStore.storeId
                      ) ===
                        Number(
                          store.storeId
                        ) && (
                        <div className="store-option-check">
                          ✓
                        </div>
                      )}

                  </button>

                ))}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

