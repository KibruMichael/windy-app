import React, { createContext, useContext, useEffect, useState } from "react";
import apiClient from "../lib/apiClient";

interface User {
  id: string;
  email?: string;
  name?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = apiClient.getToken();
    if (token) {
      apiClient.auth
        .me()
        .then((data) => setUser(data.user))
        .catch(() => {
          apiClient.auth.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await apiClient.auth.login(email, password);
    setUser(data.user);
  };

  const register = async (email: string, password: string, name: string) => {
    const data = await apiClient.auth.register(email, password, name);
    setUser(data.user);
  };

  const logout = () => {
    apiClient.auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
