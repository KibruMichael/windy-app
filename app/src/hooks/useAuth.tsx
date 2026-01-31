import React, { createContext, useContext, useEffect, useState } from "react";
import pb from "../lib/pocketbase";

interface User {
  id: string;
  email?: string;
  [k: string]: any;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = pb.authStore.model;
    if (stored) setUser(stored as any);
    setLoading(false);

    const onChange = () => {
      setUser((pb.authStore.model as any) || null);
    };

    return pb.authStore.onChange(onChange);
  }, []);

  const login = async (email: string, password: string) => {
    await pb.collection("users").authWithPassword(email, password);
    setUser(pb.authStore.model as any);
  };

  const register = async (email: string, password: string) => {
    // Create a new user in pocketbase 'users' collection
    await pb
      .collection("users")
      .create({ email, password, passwordConfirm: password });
    await login(email, password);
  };

  const logout = () => {
    pb.authStore.clear();
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
