import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/layout/AuthContext";
import "./Login.css";

const storeIcon = "/assets/store-icon.png";

export default function Login() {
  const navigate = useNavigate();

  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [feedback, setFeedback] = useState({
    type: "",
    text: "",
  });

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFeedback({ type: "", text: "" });

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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="login-signup-page">

      {/* HEADER */}
      <div className="auth-header-block">

        <div className="auth-icon-badge">
          <img src={storeIcon} alt="" />
        </div>

        <h1>Welcome back</h1>

        <p>Sign in to continue to your store</p>

      </div>


      {/* CARD */}
      <div className="auth-card">

        <form onSubmit={handleSubmit}>

          <div className="auth-input-wrap">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              disabled={isLoading}
            />
          </div>


          <div className="auth-input-wrap">

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              disabled={isLoading}
            />

            <button
              type="button"
              className="auth-eye-toggle"
              onClick={() => setShowPassword((value) => !value)}
              disabled={isLoading}
            >
              <img src="" alt="" />
            </button>

          </div>


          <div className="auth-label-row">

            <label className="auth-checkbox-row">
              <input type="checkbox" />
              Remember me
            </label>

            <button type="button" className="auth-forgot-link">
              Forgot password?
            </button>

          </div>


          {feedback.text && (
            <div className={`auth-feedback ${feedback.type}`}>
              {feedback.text}
            </div>
          )}


          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? "Please wait..." : "Login"}
            <img className="auth-submit-arrow" src="" alt="" />
          </button>

        </form>


        <div className="auth-switch-text">
          Don't have an account?
          <button type="button" className="auth-switch">
            Sign up
          </button>
        </div>

      </div>

    </main>
  );
}