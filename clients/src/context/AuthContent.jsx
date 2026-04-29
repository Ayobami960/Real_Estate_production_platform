import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // FIX: was using bitwise `|` instead of logical `||`
  const [token, setToken] = useState(
    localStorage.getItem("token") || sessionStorage.getItem("token") || null,
  );

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Rehydrate user from storage when a token exists
    if (token) {
      const storedUser =
        localStorage.getItem("user") || sessionStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Corrupted storage — clear it
          localStorage.removeItem("user");
          sessionStorage.removeItem("user");
        }
      }
    }

    // FIX: mark loading complete after rehydration
    setLoading(false);

    // FIX: define the interceptor handler inline so it can safely reference
    // the latest logout without a stale-closure issue
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.message?.includes("blocked")
        ) {
          // Clear auth state directly here to avoid calling logout before
          // it is stable in scope
          setToken(null);
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          navigate("/login");
        }
        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [token]);

  // Login
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: newToken, user: newUser } = res.data;

      setToken(newToken);
      setUser(newUser);
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      return { success: true, message: res.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message,
      };
    }
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    // FIX: was navigate("login") — missing leading slash
    navigate("/login");
  };

  // Refresh user from server
  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        // FIX: was `req.data.user` — typo, should be `res`
        const updatedUser = res.data.user;
        setUser(updatedUser);

        const storage = localStorage.getItem("token")
          ? localStorage
          : sessionStorage;
        storage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Failed to refresh the user: ", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, token, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
