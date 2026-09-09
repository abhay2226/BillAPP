import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import * as authService from "../../pages/Login/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [isLoading, setIsLoading] = useState(false);

  /**
   * LOGIN
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);

    try {
      const result = await authService.login({
        email,
        password,
      });

      const loggedInUser = result.user;
      const authToken = result.token;

      setUser(loggedInUser);
      setToken(authToken);

      // Save authentication so refresh does not log the user out
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      localStorage.setItem("token", authToken);

      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * SIGNUP
   */
  const signup = useCallback(
    async ({
      firstname,
      lastname,
      email,
      password,
      store_name,
      gst_no,
      location,
      store_id,
    }) => {
      setIsLoading(true);

      try {
        const result = await authService.signup({
          firstname,
          lastname,
          email,
          password,
          store_name,
          gst_no,
          location,
          store_id,
        });

        const createdUser = result.user;
        const authToken = result.token;

        setUser(createdUser);
        setToken(authToken);

        // Backend signup also returns a JWT,
        // so the user is immediately authenticated.
        localStorage.setItem(
          "user",
          JSON.stringify(createdUser)
        );

        localStorage.setItem("token", authToken);

        return createdUser;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * LOGOUT
   */
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      setToken(null);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: Boolean(token && user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}