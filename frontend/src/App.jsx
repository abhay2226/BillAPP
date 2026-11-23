import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import AppShell from "./components/layout/AppShell";
import { AuthProvider, useAuth } from "./components/layout/AuthContext";


import Dashboard from "./pages/Dashboard/Dashboard";
import Inventory from "./pages/Inventory/Inventory";
import Voicebilling from "./pages/Voicebilling/Voicebilling";
import Profile from "./pages/Profile/Profile";
import BillHistory from "./pages/BillHistory/BillHistory";
import Sales from "./pages/Sales/Sales";
import Login from "./pages/Login/login";
import { getSignupRoles } from "./services/authService";

function AppRoutes() {
    const { isAuthenticated, user } = useAuth();
    const [isOwner, setIsOwner] = useState(null);

    useEffect(() => {
        let active = true;

        if (!isAuthenticated || !user?.roleId) {
            setIsOwner(false);
            return undefined;
        }

        getSignupRoles()
            .then((roles) => {
                if (!active) return;

                const ownerRole = roles.find(
                    (role) =>
                        String(role.role_name).toUpperCase() === "OWNER"
                );

                setIsOwner(
                    Boolean(
                        ownerRole &&
                        Number(ownerRole.role_id) ===
                            Number(user.roleId)
                    )
                );
            })
            .catch(() => {
                if (active) setIsOwner(false);
            });

        return () => {
            active = false;
        };
    }, [isAuthenticated, user?.roleId]);

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
                <Route
                    path="/sales"
                    element={
                        !isAuthenticated
                            ? <Navigate to="/login" replace />
                            : isOwner === null
                                ? null
                                : isOwner
                                    ? <Sales />
                                    : <Navigate to="/dashboard" replace />
                    }
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