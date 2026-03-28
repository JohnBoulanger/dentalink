import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import "./style.css";

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // highlight the active nav link
  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        DentaLink
      </Link>

      <div className="nav-links">
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
            <Link to="/business/jobs" className={isActive("/business/jobs") ? "active" : ""}>
              My jobs
            </Link>
            <Link
              to="/business/create-job"
              className={isActive("/business/create-job") ? "active" : ""}
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

        {/* logout */}
        {isAuthenticated && (
          <button onClick={handleLogout} className="nav-logout">
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
