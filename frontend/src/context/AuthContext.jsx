import { createContext, useState, useContext, useEffect } from "react";
import { getMe } from "../services/api";
const AuthContext = createContext();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    checkAuth();
  }, []);
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await getMe();
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  };
  const loginUser = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };
  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};