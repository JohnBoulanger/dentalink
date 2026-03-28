import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import "../RegisterUser/style.css";
import "./style.css";

export default function AccountActivation() {
  const { resetToken } = useParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      // activate account — no password needed
      await api.post(`/auth/resets/${resetToken}`, { email });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 410) {
          setError("This activation link has expired. Request a new one below.");
        } else {
          setError(err.response?.data?.error || "Activation failed");
        }
      } else {
        setError("Activation failed");
      }
    }
  }

  if (status === "success") {
    return (
      <div className="AccountActivation page-enter">
        <div className="auth-card">
          <div className="auth-success">
            <h2>Account activated</h2>
            <p>Your account is ready to use.</p>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="AccountActivation page-enter">
      <div className="auth-card">
        <h1>Activate account</h1>
        <p className="auth-subtitle">Confirm your email to activate</p>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            placeholder="Confirm your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Activating..." : "Activate"}
          </button>
        </form>

        <p className="auth-footer">
          Link expired? <Link to="/forgot-password">Request a new one</Link>
        </p>
      </div>
    </div>
  );
}
