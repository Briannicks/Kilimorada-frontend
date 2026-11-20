import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FullPageSpinner } from "../ui/Spinner";

// For /login, /signup and /verify: logged-in users go straight to the dashboard.
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  return children ?? <Outlet />;
}