import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AlertCircle, Barcode, LayoutDashboard, Megaphone, Smartphone,
  Store, TrendingUp, UserCircle, UserCog, Users, X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getReports } from "../../api/reports";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/farmers", label: "Farmers", icon: Users },
  { to: "/reports", label: "Reports", icon: AlertCircle, showOpenCount: true },
  { to: "/prices", label: "Market Prices", icon: TrendingUp },
  { to: "/broadcasts", label: "Broadcasts", icon: Megaphone },
  { to: "/agrovets", label: "Agrovets", icon: Store },
  { to: "/batch-codes", label: "Batch Codes", icon: Barcode },
  { to: "/ussd-activity", label: "USSD Activity", icon: Smartphone },
  { to: "/users", label: "Users", icon: UserCog, adminOnly: true },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const location = useLocation();
  const [openReports, setOpenReports] = useState(0);

  // Real open-reports count for the badge, refreshed when the page changes
  useEffect(() => {
    let active = true;
    getReports({ status: "open", per_page: 1 })
      .then((data) => active && setOpenReports(data?.total || 0))
      .catch(() => active && setOpenReports(0));
    return () => {
      active = false;
    };
  }, [location.pathname]);

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "admin");

  return (
    <>
      {/* Dark overlay behind the drawer on mobile */}
      {open && <div className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2">
            <img src="/icon-192.png" alt="" className="h-9 w-9" />
            <span className="text-base font-bold tracking-wide">
              <span className="text-slate-900">KILIMO</span>
              <span className="text-green-700">-RADA</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Main">
          {items.map(({ to, label, icon: Icon, showOpenCount, adminOnly }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-green-50 font-semibold text-green-700 before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-green-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              {showOpenCount && openReports > 0 && (
                <span className="rounded-full bg-green-700 px-2 py-0.5 text-xs font-semibold text-white">
                  {openReports}
                </span>
              )}
              {adminOnly && (
                <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Admin
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}