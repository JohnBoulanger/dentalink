import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../../utils/api";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const response = await api.get("/users/me");
        console.log(response);
      }
    }
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, setToken, user, setUser, isAuthenticated, setIsAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
