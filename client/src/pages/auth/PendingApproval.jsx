import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Clock, Mail } from "lucide-react";
import AuthLayout from "../../components/layout/AuthLayout";

const STEPS = [
  { icon: CheckCircle2, text: "Account created and email verified", done: true },
  { icon: Clock, text: "An admin reviews your account", done: false },
  { icon: Mail, text: "We email you when you're approved, then you can sign in", done: false },
];

// Shown after a new officer verifies their email, or tries to sign in before approval.
export default function PendingApproval() {
  const location = useLocation();
  const message =
    location.state?.message || "Your account is waiting for admin approval. We'll email you once it's approved.";

  return (
    <AuthLayout
      title="Waiting for approval"
      subtitle={message}
      footer={
        <Link to="/login" className="font-semibold text-green-700 underline underline-offset-4 hover:text-green-800">
          Back to sign in
        </Link>
      }
    >
      <ol className="space-y-4">
        {STEPS.map(({ icon: Icon, text, done }) => (
          <li key={text} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                done ? "bg-green-700 text-white" : "bg-green-50 text-green-700"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className={`text-sm ${done ? "font-semibold text-slate-900" : "text-slate-600"}`}>{text}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
        Taking long? Contact your county agriculture office or a KilimoRada admin.
      </p>
    </AuthLayout>
  );
}