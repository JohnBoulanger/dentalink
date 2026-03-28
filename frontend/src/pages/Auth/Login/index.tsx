import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import PasswordInput from "../../../components/PasswordInput";
import "../RegisterUser/style.css";
import "./style.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notActivated, setNotActivated] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setNotActivated(false);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      const message = (err as Error).message;
      // detect "not activated" from backend 403 response
      if (message.toLowerCase().includes("not activated")) {
        setNotActivated(true);
        setError("Your account is not yet activated.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="Login page-enter">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
              {notActivated && (
                <span>
                  {" "}
                  <Link to="/forgot-password">Request activation link</Link>
                </span>
              )}
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Register as professional</Link>
          {" · "}
          <Link to="/register/business">Register as clinic</Link>
        </p>
      </div>
    </div>
  );
}
