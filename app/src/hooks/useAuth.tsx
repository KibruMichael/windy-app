import React, { createContext, useContext, useEffect, useState } from "react";
import pb from "../lib/pocketbase";

interface User {
  id: string;
  email?: string;
  name?: string;
  [k: string]: any;
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
    const stored = pb.authStore.model;
    if (stored) setUser(stored as any);
    setLoading(false);

    const onChange = () => {
      setUser((pb.authStore.model as any) || null);
    };

    return pb.authStore.onChange(onChange);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb.collection("users").authWithPassword(email, password);
      console.log("Login successful:", authData);
      setUser(pb.authStore.model as any);
    } catch (err: any) {
      console.error("Login error:", err);
      let msg = "Login failed";
      if (err?.data?.data) {
        const errors = err.data.data;
        const errorMessages = Object.entries(errors)
          .map(([field, info]: [string, any]) => `${field}: ${info?.message || info}`)
          .join(", ");
        msg = errorMessages || msg;
      } else if (err?.data?.message) {
        msg = err.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      throw new Error(msg);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("Attempting to register user:", { email, name });
      
      // Create user - only send fields that exist in the collection schema
      // Schema has: email, password, name (required), emailVisibility
      // No username field in this schema
      const userData = {
        email,
        password,
        passwordConfirm: password,
        name,
        emailVisibility: true,
      };

      console.log("Sending to PocketBase:", userData);
      const createdUser = await pb.collection("users").create(userData);
      console.log("User created successfully:", createdUser);
      
      // Auto-login after registration
      await login(email, password);
    } catch (err: any) {
      console.error("Registration error:", err);
      let msg = "Registration failed";
      
      if (err?.data?.data) {
        // PocketBase field validation errors
        const errors = err.data.data;
        const errorMessages = Object.entries(errors)
          .map(([field, info]: [string, any]) => {
            if (typeof info === 'object' && info?.message) {
              return `${field}: ${info.message}`;
            }
            return `${field}: ${info}`;
          })
          .join(", ");
        msg = errorMessages || msg;
      } else if (err?.data?.message) {
        msg = err.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      
      throw new Error(msg);
    }
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
