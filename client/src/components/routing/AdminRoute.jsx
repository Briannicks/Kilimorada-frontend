import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FullPageSpinner } from "../ui/Spinner";

// Only admins get through. Officers are sent back to the dashboard.
export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children ?? <Outlet />;
}