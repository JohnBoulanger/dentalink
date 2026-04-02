import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import "./style.css";

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // highlight the active nav link — exact match only for leaf routes
  function isActive(path: string, exact = false) {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  // close popovers on escape key
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setShowConfirm(false);
    }
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        DentaLink
      </Link>

      <div className="nav-links" onKeyDown={handleKeyDown}>
        {/* public links */}
        <Link to="/businesses" className={isActive("/businesses") ? "active" : ""}>
          Clinics
        </Link>

        {/* unauthenticated */}
        {!isAuthenticated && (
          <>
            <Link to="/login" className={isActive("/login") ? "active" : ""}>
              Sign in
            </Link>
            <Link to="/register" className="nav-register">
              Register
            </Link>
          </>
        )}

        {/* regular user links */}
        {isAuthenticated && role === "regular" && (
          <>
            <Link to="/jobs" className={isActive("/jobs") ? "active" : ""}>
              Jobs
            </Link>
            <Link to="/my-jobs" className={isActive("/my-jobs") ? "active" : ""}>
              My jobs
            </Link>
            <Link to="/position-types" className={isActive("/position-types") ? "active" : ""}>
              Positions
            </Link>
            <Link to="/qualifications" className={isActive("/qualifications") ? "active" : ""}>
              Qualifications
            </Link>
            <Link to="/profile" className={isActive("/profile") ? "active" : ""}>
              Profile
            </Link>
          </>
        )}

        {/* business user links */}
        {isAuthenticated && role === "business" && (
          <>
            <Link to="/business/jobs" className={isActive("/business/jobs", true) ? "active" : ""}>
              My jobs
            </Link>
            <Link
              to="/business/jobs/new"
              className={isActive("/business/jobs/new", true) ? "active" : ""}
            >
              Post job
            </Link>
            <Link to="/business/profile" className={isActive("/business/profile") ? "active" : ""}>
              Profile
            </Link>
          </>
        )}

        {/* admin links */}
        {isAuthenticated && role === "admin" && (
          <>
            <Link to="/admin/users" className={isActive("/admin/users") ? "active" : ""}>
              Users
            </Link>
            <Link to="/admin/businesses" className={isActive("/admin/businesses") ? "active" : ""}>
              Businesses
            </Link>
            <Link
              to="/admin/position-types"
              className={isActive("/admin/position-types") ? "active" : ""}
            >
              Positions
            </Link>
            <Link
              to="/admin/qualifications"
              className={isActive("/admin/qualifications") ? "active" : ""}
            >
              Qualifications
            </Link>
            <Link to="/admin/settings" className={isActive("/admin/settings") ? "active" : ""}>
              Settings
            </Link>
          </>
        )}

        {/* logout with confirmation popover */}
        {isAuthenticated && (
          <div className="nav-logout-wrap" ref={wrapperRef}>
            <button onClick={() => setShowConfirm((v) => !v)} className="nav-logout">
              Sign out
            </button>
            {showConfirm && (
              <div className="nav-logout-confirm" role="dialog" aria-label="confirm sign out">
                <span>Sign out?</span>
                <button className="nav-logout-cancel" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
                <button className="nav-logout-ok" onClick={handleLogout}>
                  Confirm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
