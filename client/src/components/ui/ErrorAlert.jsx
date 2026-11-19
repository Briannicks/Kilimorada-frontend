
import { AlertCircle, RotateCw } from "lucide-react";

export default function ErrorAlert({
  message,
  onRetry,
  className = ""
}) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      />

      <p className="flex-1">{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex shrink-0 items-center gap-1 font-semibold text-red-700 hover:underline"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
