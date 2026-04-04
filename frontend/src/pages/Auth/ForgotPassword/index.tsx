import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import "../RegisterUser/style.css";
import "./style.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const response = await api.post("/auth/resets", { email });
      // navigate directly to reset page — don't expose the token in UI
      navigate(`/reset-password/${response.data.resetToken}`);
    } catch (err) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 429) {
          setError("Too many requests. Please wait before trying again.");
        } else if (code === 404) {
          setError("No account found with this email.");
        } else {
          setError(err.response?.data?.error || "Request failed");
        }
      } else {
        setError("Request failed");
      }
    }
  }

  return (
    <div className="ForgotPassword page-enter">
      <div className="auth-card">
        <h1>Forgot password</h1>
        <p className="auth-subtitle">Enter your email to get a reset link</p>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
