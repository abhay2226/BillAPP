import React,{useState}from "react";

const login_signup = ()=>{
    const[email, setEmail]= useState();
    const[password , setPassword]= useState();
    const[confirmPassword , setConfirmPassword]=useState();

    const handleLogin = (e)=>{
        e.preventDefault();

    };
    const handleSignin = (e)=>{
        e.preventDefault();
        console
    };



    return(
        <>
        <div className="main-container">
            <div class="login-container">
                <h1>Login</h1>
                <form onSubmit={handleLogin}>
                    <input 
                    type="email"
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required/>
                    <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    required/>
                    <button type="submit"> Login </button>
                </form>
                <div class="signup-link">
                    <span><a>Create an account</a></span>
                </div>

            </div>
        </div>
        </>
    );
};

