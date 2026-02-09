import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import "./auth.css";

const LoginForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      const msg = err?.message || "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>Sign In</h2>
      {error && <div className="auth-error">{error}</div>}
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        aria-label="email"
        autoComplete="email"
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError(null);
        }}
        aria-label="password"
        autoComplete="current-password"
      />
      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <button
        type="button"
        className="link"
        onClick={onSwitch}
        disabled={loading}
      >
        Create account
      </button>
    </form>
  );
};

const RegisterForm: React.FC<{ onSwitch: () => void }> = ({ onSwitch }) => {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!name || name.length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    setError(null);
    return true;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      await register(email, password, name);
    } catch (err: any) {
      const msg = err?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>Create Account</h2>
      {error && <div className="auth-error">{error}</div>}
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError(null);
        }}
        aria-label="email"
        autoComplete="email"
      />
      <input
        placeholder="Full Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (error) setError(null);
        }}
        aria-label="name"
        autoComplete="name"
      />
      <input
        placeholder="Password (min 8 characters)"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError(null);
        }}
        aria-label="password"
        autoComplete="new-password"
      />
      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? "Creating..." : "Create Account"}
      </button>
      <button
        type="button"
        className="link"
        onClick={onSwitch}
        disabled={loading}
      >
        Sign in
      </button>
    </form>
  );
};

const AuthPanel: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  return (
    <div className="auth-panel">
      {showRegister ? (
        <RegisterForm onSwitch={() => setShowRegister(false)} />
      ) : (
        <LoginForm onSwitch={() => setShowRegister(true)} />
      )}
    </div>
  );
};

export default AuthPanel;
