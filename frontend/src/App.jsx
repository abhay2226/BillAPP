// import { Routes, Route, Navigate } from "react-router-dom";

// import Dashboard from "./pages/Dashboard/Dashboard";
// import Inventory from "./pages/Inventory/Inventory";
// import Voicebilling from "./pages/Voicebilling/Voicebilling";

// import "./App.css";

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Navigate to="/dashboard" replace />} />

//       <Route path="/dashboard" element={<Dashboard />} />

//       <Route path="/inventory" element={<Inventory />} />

//       <Route path="/billing" element={<Voicebilling />} />
//     </Routes>
//   );
// }

// export default App;

import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import { AuthProvider, useAuth } from "./components/layout/AuthContext";


import Dashboard from "./pages/Dashboard/Dashboard";
import Inventory from "./pages/Inventory/Inventory";
import Voicebilling from "./pages/Voicebilling/Voicebilling";
import Profile from "./pages/Profile/Profile";
// import Login,{SESSION_KEY} from "./pages/Login/login";
import Login from "./pages/Login/login";

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/"
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />}
            />

            <Route element={<AppShell />}>
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
                />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/inventory"
                    element={isAuthenticated ? <Inventory /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/billing"
                    element={isAuthenticated ? <Voicebilling /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/profile"
                    element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
                />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;