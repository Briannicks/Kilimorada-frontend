
import { useEffect, useId } from "react";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl"
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  iconTone = "green",
  children,
  footer,
  size = "md"
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`relative flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-lg sm:rounded-3xl ${SIZES[size]}`}
      >
        <div className="flex items-start gap-3 border-b border-slate-100 px-6 pb-4 pt-6">
          {Icon && (
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                iconTone === "red"
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>

            {description && (
              <p id={descriptionId} className="mt-0.5 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
