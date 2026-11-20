import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import AdminRoute from "./components/routing/AdminRoute";
import GuestRoute from "./components/routing/GuestRoute";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Verify from "./pages/auth/Verify";
import PendingApproval from "./pages/auth/PendingApproval";
import Dashboard from "./pages/dashboard/Dashboard";
import Farmers from "./pages/farmers/Farmers";
import FarmerDetail from "./pages/farmers/FarmerDetail";
import Reports from "./pages/reports/Reports";
import ReportDetail from "./pages/reports/ReportDetail";
import Prices from "./pages/prices/Prices";
import Broadcasts from "./pages/broadcasts/Broadcasts";
import Agrovets from "./pages/agrovets/Agrovets";
import BatchCodes from "./pages/batch-codes/BatchCodes";
import UssdActivity from "./pages/ussd/UssdActivity";
import Users from "./pages/users/Users";
import Profile from "./pages/profile/Profile";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* No landing page: "/" goes to the dashboard, or to /login if not signed in */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Only for people who are NOT logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/pending" element={<PendingApproval />} />
      </Route>

      {/* Logged-in admins and officers */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/farmers" element={<Farmers />} />
          <Route path="/farmers/:id" element={<FarmerDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/broadcasts" element={<Broadcasts />} />
          <Route path="/agrovets" element={<Agrovets />} />
          <Route path="/batch-codes" element={<BatchCodes />} />
          <Route path="/ussd-activity" element={<UssdActivity />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admins only */}
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}