import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext/AuthContext";
import LoadingSpinner from "../LoadingSpinner";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

// guards routes that require authentication and optionally a specific role
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // wait for auth check to finish
  if (loading) return <LoadingSpinner />;

  // redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // redirect home if role is null or not in the allowed set
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
