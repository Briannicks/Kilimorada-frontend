import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import Button from "../components/ui/Button";
import logo from "../assets/logo.png";

// Shown for any address that does not exist, e.g. /farmerz
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F9F8] px-4 py-10 text-center">
      <img src={logo} alt="KilimoRada" className="mb-8 w-28" />
      <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Page not found</p>
      <h1 className="mt-2 text-3xl font-semibold text-slate-900">We couldn't find that page</h1>
      <p className="mt-3 max-w-md text-slate-500">
        The link may be wrong, or the page may have been moved. Check the address or go back to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button icon={Home} onClick={() => navigate("/dashboard")}>
          Go to dashboard
        </Button>
      </div>
    </main>
  );
}