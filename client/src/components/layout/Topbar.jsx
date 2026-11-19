import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PAGE_TITLES = {
  dashboard: "Dashboard",
  farmers: "Farmers",
  reports: "Reports",
  prices: "Market Prices",
  broadcasts: "Broadcasts",
  agrovets: "Agrovets",
  "batch-codes": "Batch Codes",
  "ussd-activity": "USSD Activity",
  users: "Users",
  profile: "Profile",
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const section = location.pathname.split("/")[1];
  const title = PAGE_TITLES[section] || "KilimoRada";

  // Close the dropdown when clicking outside it
  useEffect(() => {
    const onClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-full p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="flex-1 truncate text-lg font-semibold text-slate-900">{title}</h1>

      {user && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 hover:bg-slate-50"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-sm font-semibold text-white">
                {initials(user.name)}
              </span>
            )}
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-slate-900">{user.name}</span>
              <span className="block text-xs capitalize leading-tight text-slate-500">{user.role}</span>
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div role="menu" className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-md">
              <Link
                to="/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <UserCircle className="h-4 w-4" /> Profile
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}