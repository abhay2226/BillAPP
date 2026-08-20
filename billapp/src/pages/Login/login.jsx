// import React,{useState}from "react";

// const login_signup = ()=>{
//     const[email, setEmail]= useState();
//     const[password , setPassword]= useState();
//     const[confirmPassword , setConfirmPassword]=useState();
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//       });
//     const [errors, setErrors] = useState({});
//     const [showPassword, setShowPassword] = useState(false);
//     const [submitted, setSubmitted] = useState(false);
    
//     function handleChange(e) {
//       const { name, value } = e.target;
//       setFormData((prev) => ({ ...prev, [name]: value }));
//       if (errors[name]) {
//         setErrors((prev) => ({ ...prev, [name]: "" }));
//       }
//     }

//     function validate() {
//       const newErrors = {};
  
//       if (mode === "signup" && !formData.name.trim()) {
//         newErrors.name = "Name is required";
//       }
  
//       if (!formData.email.trim()) {
//         newErrors.email = "Email is required";
//       } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//         newErrors.email = "Enter a valid email";
//       }
  
//       if (!formData.password) {
//         newErrors.password = "Password is required";
//       } else if (formData.password.length < 6) {
//         newErrors.password = "Password must be at least 6 characters";
//       }
  
//       if (mode === "signup" && formData.confirmPassword !== formData.password) {
//         newErrors.confirmPassword = "Passwords do not match";
//       }
  
//       return newErrors;
//     }



//     const handleLogin = (e)=>{
//         e.preventDefault();
//         try {
//          const response = await axios.post("http://localhost:5000/login", { email, password });
//          alert(response.data.message);
//         } catch (err) {
//          setError("Invalid credentials");
//         }

//     };
//     const handleSignin = (e)=>{
//         e.preventDefault();
//         console
//     };

//     function handleSubmit() {
//       const newErrors = validate();
//       setErrors(newErrors);
  
//       if (Object.keys(newErrors).length === 0) {
//           onsole.log(mode === "login" ? "Logging in with:" : "Signing up with:", formData);
//         setSubmitted(true);
//         setTimeout(() => setSubmitted(false), 2500);
//       }
//     }

//     function switchMode(newMode) {
//       setMode(newMode);
//       setErrors({});
//       setFormData({ name: "", email: "", password: "", confirmPassword: "" });
//     }



//     return(
//         <body>
//         <div className="main-container">
//             <div class="login-container">
//                 <h1>Login</h1>
//                 <form onSubmit={handleLogin}>
//                     <input 
//                     type="email"
//                     placeholder="Enter your Email"
//                     value={email}
//                     onChange={(e)=>setEmail(e.target.value)}
//                     required/>
//                     <input
//                     type="password"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e)=>setPassword(e.target.value)}
//                     required/>
//                     <button type="submit"> Login </button>
//                 </form>
//                 <div class="signup-link">
//                     <span><a>Create an account</a></span>
//                 </div>

//             </div>
//             <div class="signin-container">
//                 <h1>Login</h1>
//                 <form onSubmit={handleLogin}>
//                     <input 
//                     type="email"
//                     placeholder="Enter your Email"
//                     value={email}
//                     onChange={(e)=>setEmail(e.target.value)}
//                     required/>
//                     <input
//                     type="password"
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e)=>setPassword(e.target.value)}
//                     required/>
//                     <button type="submit"> Login </button>
//                 </form>
//                 <div class="signup-link">
//                     <span><a>Create an account</a></span>
//                 </div>

//             </div>
//         </div>
//         </body>
//     );
// };

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/layout/AuthContext";

import "./Login.css";

// import storeIcon from "../../assets/icons/store.png"

function Login() {
    const navigate = useNavigate();
    const { login, signup, isLoading } = useAuth();
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
            <section className="auth-device" aria-label="Login-Signup">
                <div className="auth-screen">

                    <div className="auth-copy">
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
                            <button className="auth-submit" type="submit" disabled={isLoading}>
                                {isLoading ? "PLEASE WAIT..." : isSignUp ? "CREATE ACCOUNT" : "LOG IN"}
                            </button>
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

export default Login;