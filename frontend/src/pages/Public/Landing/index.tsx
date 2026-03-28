import { Link } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext/AuthContext";
import "./style.css";

export default function Landing() {
  const { isAuthenticated, role } = useAuth();

  // redirect authenticated users to their dashboard
  function getDashboardPath() {
    if (role === "business") return "/business/jobs";
    if (role === "admin") return "/admin/users";
    return "/jobs";
  }

  return (
    <div className="Landing page-enter">
      <section className="hero">
        <h1>
          The modern way to
          <br />
          staff dental clinics
        </h1>
        <p className="hero-subtitle">
          Connect qualified dental professionals with clinics that need them. Flexible shifts,
          verified qualifications, real-time matching.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to={getDashboardPath()} className="btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary">
                Sign in
              </Link>
              <Link to="/register" className="btn-secondary">
                Create account
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>For professionals</h3>
          <p>
            Browse available shifts, manage qualifications, and get matched with clinics near you.
          </p>
        </div>
        <div className="feature-card">
          <h3>For clinics</h3>
          <p>Post positions, discover qualified candidates, and negotiate terms in real time.</p>
        </div>
        <div className="feature-card">
          <h3>Verified credentials</h3>
          <p>
            Qualification review ensures every professional meets the standards your clinic
            requires.
          </p>
        </div>
      </section>

      <section className="browse-cta">
        <Link to="/businesses">Browse clinics &rarr;</Link>
      </section>
    </div>
  );
}
