import { Routes, Route, Navigate } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import { AuthProvider, useAuth } from "./components/layout/AuthContext";


import Dashboard from "./pages/Dashboard/Dashboard";
import Inventory from "./pages/Inventory/Inventory";
import Voicebilling from "./pages/Voicebilling/Voicebilling";
import Profile from "./pages/Profile/Profile";
import BillHistory from "./pages/BillHistory/BillHistory";
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
                <Route
                    path="/billhistory"
                    element={isAuthenticated ? <BillHistory /> : <Navigate to="/login" replace />}
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