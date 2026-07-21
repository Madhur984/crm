import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (getToken()) {
        try {
          const { user, org } = await api.me();
          if (alive) { setUser(user); setOrg(org); }
        } catch {
          setToken(null);
        }
      }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, []);

  const login = async (email, password) => {
    const { token, user } = await api.login(email, password);
    setToken(token);
    setUser(user);
    try { const { org } = await api.me(); setOrg(org); } catch { /* non-fatal */ }
    return user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOrg(null);
  };

  const refreshUser = async () => {
    try { const { user, org } = await api.me(); setUser(user); setOrg(org); } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, org, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
