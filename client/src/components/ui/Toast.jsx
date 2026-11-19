
import { CheckCircle2, X, XCircle } from "lucide-react";

export function ToastList({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}

export default function Toast({
  type = "success",
  message,
  onDismiss
}) {
  const success = type === "success";
  const Icon = success ? CheckCircle2 : XCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-l-4 border-slate-200 bg-white px-4 py-3 shadow-md ${
        success
          ? "border-l-green-700"
          : "border-l-red-600"
      }`}
    >
      <Icon
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          success ? "text-green-700" : "text-red-600"
        }`}
        aria-hidden="true"
      />

      <p className="flex-1 text-sm text-slate-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onDismiss}
        className="text-slate-400 hover:text-slate-600"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
