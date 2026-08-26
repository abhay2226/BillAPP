// // import React,{useState}from "react";

// // const login_signup = ()=>{
// //     const[email, setEmail]= useState();
// //     const[password , setPassword]= useState();
// //     const[confirmPassword , setConfirmPassword]=useState();
// //     const [formData, setFormData] = useState({
// //         name: "",
// //         email: "",
// //         password: "",
// //         confirmPassword: "",
// //       });
// //     const [errors, setErrors] = useState({});
// //     const [showPassword, setShowPassword] = useState(false);
// //     const [submitted, setSubmitted] = useState(false);
    
// //     function handleChange(e) {
// //       const { name, value } = e.target;
// //       setFormData((prev) => ({ ...prev, [name]: value }));
// //       if (errors[name]) {
// //         setErrors((prev) => ({ ...prev, [name]: "" }));
// //       }
// //     }

// //     function validate() {
// //       const newErrors = {};
  
// //       if (mode === "signup" && !formData.name.trim()) {
// //         newErrors.name = "Name is required";
// //       }
  
// //       if (!formData.email.trim()) {
// //         newErrors.email = "Email is required";
// //       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
// //         newErrors.email = "Enter a valid email";
// //       }
  
// //       if (!formData.password) {
// //         newErrors.password = "Password is required";
// //       } else if (formData.password.length < 6) {
// //         newErrors.password = "Password must be at least 6 characters";
// //       }
  
// //       if (mode === "signup" && formData.confirmPassword !== formData.password) {
// //         newErrors.confirmPassword = "Passwords do not match";
// //       }
  
// //       return newErrors;
// //     }



// //     const handleLogin = (e)=>{
// //         e.preventDefault();
// //         try {
// //          const response = await axios.post("http://localhost:5000/login", { email, password });
// //          alert(response.data.message);
// //         } catch (err) {
// //          setError("Invalid credentials");
// //         }

// //     };
// //     const handleSignin = (e)=>{
// //         e.preventDefault();
// //         console
// //     };

// //     function handleSubmit() {
// //       const newErrors = validate();
// //       setErrors(newErrors);
  
// //       if (Object.keys(newErrors).length === 0) {
// //           onsole.log(mode === "login" ? "Logging in with:" : "Signing up with:", formData);
// //         setSubmitted(true);
// //         setTimeout(() => setSubmitted(false), 2500);
// //       }
// //     }

// //     function switchMode(newMode) {
// //       setMode(newMode);
// //       setErrors({});
// //       setFormData({ name: "", email: "", password: "", confirmPassword: "" });
// //     }



// //     return(
// //         <body>
// //         <div className="main-container">
// //             <div class="login-container">
// //                 <h1>Login</h1>
// //                 <form onSubmit={handleLogin}>
// //                     <input 
// //                     type="email"
// //                     placeholder="Enter your Email"
// //                     value={email}
// //                     onChange={(e)=>setEmail(e.target.value)}
// //                     required/>
// //                     <input
// //                     type="password"
// //                     placeholder="Enter your password"
// //                     value={password}
// //                     onChange={(e)=>setPassword(e.target.value)}
// //                     required/>
// //                     <button type="submit"> Login </button>
// //                 </form>
// //                 <div class="signup-link">
// //                     <span><a>Create an account</a></span>
// //                 </div>

// //             </div>
// //             <div class="signin-container">
// //                 <h1>Login</h1>
// //                 <form onSubmit={handleLogin}>
// //                     <input 
// //                     type="email"
// //                     placeholder="Enter your Email"
// //                     value={email}
// //                     onChange={(e)=>setEmail(e.target.value)}
// //                     required/>
// //                     <input
// //                     type="password"
// //                     placeholder="Enter your password"
// //                     value={password}
// //                     onChange={(e)=>setPassword(e.target.value)}
// //                     required/>
// //                     <button type="submit"> Login </button>
// //                 </form>
// //                 <div class="signup-link">
// //                     <span><a>Create an account</a></span>
// //                 </div>

// //             </div>
// //         </div>
// //         </body>
// //     );
// // };

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../components/layout/AuthContext";

// import "./Login.css";

// // import storeIcon from "../../assets/icons/store.png"

// function Login() {
//     const navigate = useNavigate();
//     const { login, signup, isLoading } = useAuth();
//     const [isSignUp, setIsSignUp] = useState(false);
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [feedback, setFeedback] = useState({ type: "", text: "" });

//     const toggleMode = () => {
//         setIsSignUp((mode) => !mode);
//         setFeedback({ type: "", text: "" });
//         setPassword("");
//         setConfirmPassword("");
//     };

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         setFeedback({ type: "", text: "" });

//         if (isSignUp && password !== confirmPassword) {
//             setFeedback({ type: "error", text: "Your passwords do not match." });
//             return;
//         }

//         try {
//             if (isSignUp) {
//                 await signup(email, password);
//             } else {
//                 await login(email, password);
//             }
//             navigate("/dashboard", { replace: true });
//         } catch (error) {
//             setFeedback({ type: "error", text: error.message });
//         }
//     };

//     return (
//         <main className="login-signup-page">
//             <section className="auth-device" aria-label="Login-Signup">
//                 <div className="auth-screen">

//                     <div className="auth-copy">
//                         <h1>{isSignUp ? "Build your shop's next chapter." : "Big business, pocket-sized control."}</h1>
//                         <p>{isSignUp ? "Create your account and make every sale count." : "Keep your products, customers, and daily sales moving in one place."}</p>
//                     </div>

//                     <div className="auth-form-panel">
//                         <p className="auth-kicker">{isSignUp ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</p>
//                         <form onSubmit={handleSubmit}>
//                             <label htmlFor="email">Email address</label>
//                             <div className="auth-input-wrap">
//                                 <span aria-hidden="true">@</span>
//                                 <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
//                             </div>

//                             <label htmlFor="password">Password</label>
//                             <div className="auth-input-wrap">
//                                 <span aria-hidden="true">*</span>
//                                 <input id="password" type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} required />
//                             </div>

//                             {isSignUp && (
//                                 <>
//                                     <label htmlFor="confirm-password">Confirm password</label>
//                                     <div className="auth-input-wrap">
//                                         <span aria-hidden="true">*</span>
//                                         <input id="confirm-password" type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={6} required />
//                                     </div>
//                                 </>
//                             )}

//                             {feedback.text && <p className={`auth-feedback ${feedback.type}`}>{feedback.text}</p>}
//                             <button className="auth-submit" type="submit" disabled={isLoading}>
//                                 {isLoading ? "PLEASE WAIT..." : isSignUp ? "CREATE ACCOUNT" : "LOG IN"}
//                             </button>
//                         </form>

//                         <p className="auth-switch-text">
//                             {isSignUp ? "Already have an account?" : "New to BillAPP?"}{" "}
//                             <button className="auth-switch" type="button" onClick={toggleMode}>{isSignUp ? "Log in" : "Create an account"}</button>
//                         </p>
//                     </div>
//                 </div>
//             </section>
//         </main>
//     );
// }

// export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/layout/AuthContext";
import storeIcon from "../../assets/icons/store.png";

import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login, signup, isLoading } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", text: "" });

    const toggleMode = () => {
        setIsSignUp((mode) => !mode);
        setFeedback({ type: "", text: "" });
        setPassword("");
        setConfirmPassword("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFeedback({ type: "", text: "" });

        if (isSignUp && password !== confirmPassword) {
            setFeedback({ type: "error", text: "Your passwords do not match." });
            return;
        }

        try {
            if (isSignUp) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
            navigate("/dashboard", { replace: true });
        } catch (error) {
            setFeedback({ type: "error", text: error.message });
        }
    };

    return (
        <main className="login-signup-page">
            <div className="auth-header-block">
                <div className="auth-icon-badge">
                    <img src={storeIcon} alt="ProShop" />
                </div>
                <h1>{isSignUp ? "Create your account" : "Welcome back"}</h1>
                <p>{isSignUp ? "Set up your shop to get started." : "Please enter your details to sign in."}</p>
            </div>

            <div className="auth-card">
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email Address</label>
                    <div className="auth-input-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18v12H3z" />
                            <path d="M3 6l9 7 9-7" />
                        </svg>
                        <input
                            id="email"
                            type="email"
                            placeholder="merchant@example.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-label-row">
                        <label htmlFor="password">Password</label>
                        {!isSignUp && (
                            <button type="button" className="auth-forgot-link">Forgot Password?</button>
                        )}
                    </div>
                    <div className="auth-input-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="10" width="16" height="10" rx="2" />
                            <path d="M8 10V7a4 4 0 018 0v3" />
                        </svg>
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            minLength={6}
                            required
                        />
                        <button
                            type="button"
                            className="auth-eye-toggle"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 3l18 18" />
                                    <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                                    <path d="M9.9 4.24A10.6 10.6 0 0112 4c6.5 0 10 7 10 7a13.2 13.2 0 01-3.1 3.9M6.6 6.6C4 8.3 2 12 2 12s3.5 7 10 7a10.4 10.4 0 004.2-.86" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {isSignUp && (
                        <>
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <div className="auth-input-wrap">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="4" y="10" width="16" height="10" rx="2" />
                                    <path d="M8 10V7a4 4 0 018 0v3" />
                                </svg>
                                <input
                                    id="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </>
                    )}

                    {!isSignUp && (
                        <label className="auth-checkbox-row">
                            <input type="checkbox" />
                            <span>Keep me signed in</span>
                        </label>
                    )}

                    {feedback.text && <p className={`auth-feedback ${feedback.type}`}>{feedback.text}</p>}

                    <button className="auth-submit" type="submit" disabled={isLoading}>
                        {isLoading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
                        {!isLoading && <span className="auth-submit-arrow">→</span>}
                    </button>
                </form>
            </div>

            <p className="auth-switch-text">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button className="auth-switch" type="button" onClick={toggleMode}>
                    {isSignUp ? "Log in" : "Create new account"}
                </button>
            </p>
        </main>
    );
}

export default Login;