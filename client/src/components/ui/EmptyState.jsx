
import { Inbox } from "lucide-react";

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  action
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
        <Icon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {title}
      </h3>

      {message && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {message}
        </p>
      )}

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
