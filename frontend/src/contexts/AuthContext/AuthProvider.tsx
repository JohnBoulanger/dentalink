import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import api from "../../utils/api";
import axios from "axios";

// decode jwt payload without external library
function decodeToken(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid token format");
  return JSON.parse(atob(parts[1]));
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // load user data on mount if token exists in storage
  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      setToken(storedToken);

      // decode jwt to determine user role and check expiry
      const payload = decodeToken(storedToken);
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        setToken(null);
        setLoading(false);
        return;
      }
      const userRole = payload.role;
      setRole(userRole);

      // fetch profile from the correct endpoint based on role
      let response;
      if (userRole === "regular") {
        response = await api.get("/users/me");
      } else if (userRole === "business") {
        response = await api.get("/businesses/me");
      } else if (userRole === "admin") {
        // no admin profile endpoint — use decoded jwt data
        response = { data: { id: payload.accountId, role: "admin" } };
      }

      setUser(response?.data ?? null);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setToken(null);
      setRole(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  // log the user in via /auth/tokens
  async function login(email: string, password: string) {
    try {
      const response = await api.post("/auth/tokens", { email, password });
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      await loadUser();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        throw new Error(err.response?.data?.error || "Login failed");
      }
      throw new Error("Login failed");
    }
  }

  // clear all auth state
  function logout() {
    setUser(null);
    setToken(null);
    setRole(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
  }

  const value = { token, user, role, isAuthenticated, login, logout, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
