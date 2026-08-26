import { createContext, useContext, useState, useCallback } from "react";
import * as authService from "../../pages/Login/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const { user: loggedInUser, token: authToken } = await authService.login({ email, password });
            setUser(loggedInUser);
            setToken(authToken);
            return loggedInUser;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const { user: newUser, token: authToken } = await authService.signup({ email, password });
            setUser(newUser);
            setToken(authToken);
            return newUser;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setToken(null);
    }, []);

    const value = { user, token, isAuthenticated: Boolean(user), isLoading, login, signup, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}