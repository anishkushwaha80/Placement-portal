import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("pp_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("pp_token", data.token);
    localStorage.setItem("pp_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password, role) {
    const { data } = await api.post("/auth/register", { name, email, password, role });
    localStorage.setItem("pp_token", data.token);
    localStorage.setItem("pp_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
