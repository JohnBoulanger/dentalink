import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import "../RegisterUser/style.css";
import "./style.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");
    try {
      const response = await api.post("/auth/resets", { email });
      setResetToken(response.data.resetToken);
      setStatus("success");
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

  // show the reset token after successful request
  if (status === "success") {
    return (
      <div className="ForgotPassword page-enter">
        <div className="auth-card">
          <div className="auth-success">
            <h2>Reset link generated</h2>
            <p>Use the link below to reset your password.</p>
            <div className="token-display">{resetToken}</div>
            <Link to={`/reset-password/${resetToken}`}>Reset password</Link>
          </div>
        </div>
      </div>
    );
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
