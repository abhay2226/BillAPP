import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

const ACCOUNT_KEY = "billapp-account";
const SESSION_KEY = "billapp-authenticated";

function Login() {
    const navigate = useNavigate();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [feedback, setFeedback] = useState({ type: "", text: "" });

    const toggleMode = () => {
        setIsSignUp((mode) => !mode);
        setFeedback({ type: "", text: "" });
        setPassword("");
        setConfirmPassword("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFeedback({ type: "", text: "" });

        if (isSignUp) {
            if (password !== confirmPassword) {
                setFeedback({ type: "error", text: "Your passwords do not match." });
                return;
            }

            localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ email, password }));
            setIsSignUp(false);
            setPassword("");
            setConfirmPassword("");
            setFeedback({ type: "success", text: "Account created. Please log in." });
            return;
        }

        const account = JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
        if (!account || account.email !== email || account.password !== password) {
            setFeedback({ type: "error", text: "Email or password is incorrect." });
            return;
        }

        localStorage.setItem(SESSION_KEY, "true");
        navigate("/dashboard", { replace: true });
    };

    return (
        <main className="auth-page">
            <section className="auth-device" aria-label="BillAPP authentication">
                <div className="device-camera" aria-hidden="true" />
                <div className="auth-screen">
                    <header className="auth-brand">
                        <span className="brand-mark" aria-hidden="true">✓</span>
                        <span><strong>PRO</strong><b>SHOP</b></span>
                    </header>

                    <div className="auth-copy">
                        <p className="auth-eyebrow">BillAPP</p>
                        <h1>{isSignUp ? "Build your shop's next chapter." : "Big business, pocket-sized control."}</h1>
                        <p>{isSignUp ? "Create your account and make every sale count." : "Keep your products, customers, and daily sales moving in one place."}</p>
                    </div>

                    <div className="auth-form-panel">
                        <p className="auth-kicker">{isSignUp ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</p>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="email">Email address</label>
                            <div className="auth-input-wrap">
                                <span aria-hidden="true">@</span>
                                <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
                            </div>

                            <label htmlFor="password">Password</label>
                            <div className="auth-input-wrap">
                                <span aria-hidden="true">*</span>
                                <input id="password" type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
                            </div>

                            {isSignUp && (
                                <>
                                    <label htmlFor="confirm-password">Confirm password</label>
                                    <div className="auth-input-wrap">
                                        <span aria-hidden="true">*</span>
                                        <input id="confirm-password" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required />
                                    </div>
                                </>
                            )}

                            {feedback.text && <p className={`auth-feedback ${feedback.type}`}>{feedback.text}</p>}
                            <button className="auth-submit" type="submit">{isSignUp ? "CREATE ACCOUNT" : "LOG IN"}</button>
                        </form>

                        <p className="auth-switch-text">
                            {isSignUp ? "Already have an account?" : "New to BillAPP?"}{" "}
                            <button className="auth-switch" type="button" onClick={toggleMode}>{isSignUp ? "Log in" : "Create an account"}</button>
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}

export { SESSION_KEY };
export default Login;

