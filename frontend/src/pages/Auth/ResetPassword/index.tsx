import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../../utils/api";
import PasswordInput from "../../../components/PasswordInput";
import "../RegisterUser/style.css";
import "./style.css";

// password must match backend validation
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?/{}~|]).{8,20}$/;

export default function ResetPassword() {
  const { resetToken } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    // client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!PASSWORD_REGEX.test(password)) {
      setError(
        "Password must be 8–20 characters with uppercase, lowercase, digit, and special character."
      );
      return;
    }

    setStatus("loading");
    try {
      await api.post(`/auth/resets/${resetToken}`, { email, password });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      if (axios.isAxiosError(err)) {
        const code = err.response?.status;
        if (code === 410) {
          setError("This reset link has expired. Request a new one.");
        } else {
          setError(err.response?.data?.error || "Reset failed");
        }
      } else {
        setError("Reset failed");
      }
    }
  }

  if (status === "success") {
    return (
      <div className="ResetPassword page-enter">
        <div className="auth-card">
          <div className="auth-success">
            <h2>Password reset</h2>
            <p>Your password has been updated successfully.</p>
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ResetPassword page-enter">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p className="auth-subtitle">Choose a new password</p>

        <form onSubmit={handleSubmit}>
          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordInput
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="hint">
            8–20 characters, uppercase, lowercase, digit, and special character
          </p>

          <PasswordInput
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary" disabled={status === "loading"}>
            {status === "loading" ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="auth-footer">
          <Link to="/forgot-password">Request a new link</Link>
        </p>
      </div>
    </div>
  );
}
