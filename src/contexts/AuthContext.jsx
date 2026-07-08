import { createContext, useContext, useState, useCallback, useEffect } from "react";
import * as api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const stored = api.getStoredAuth();
    if (stored) {
      setUser({ username: stored.username, token: stored.token, userId: stored.userId });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await api.login(username, password);
      setUser({ username: data.username, token: data.token, userId: data.id });
      return data;
    } catch (err) {
      setError(err.message || "Falha no login");
      throw err;
    }
  }, []);

  const register = useCallback(async (username, password) => {
    setError(null);
    try {
      const data = await api.register(username, password);
      setUser({ username: data.username, token: data.token, userId: data.id });
      return data;
    } catch (err) {
      setError(err.message || "Falha no registro");
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
