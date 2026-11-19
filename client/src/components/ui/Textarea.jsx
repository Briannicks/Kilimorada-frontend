
import { forwardRef, useId } from "react";

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    hint,
    maxLength,
    value,
    rows = 4,
    id,
    required,
    className = "",
    ...props
  },
  ref
) {
  const autoId = useId();
  const textareaId = id || autoId;
  const length = String(value ?? "").length;
  const over = maxLength != null && length > maxLength;

  return (
    <div className={className}>
      {(label || maxLength != null) && (
        <div className="mb-1.5 flex items-center justify-between gap-4">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-sm font-semibold text-slate-800"
            >
              {label}
              {required && <span className="ml-0.5 text-red-600">*</span>}
            </label>
          )}

          {maxLength != null && (
            <span className={`ml-auto text-xs ${
              over ? "font-semibold text-red-600" : "text-slate-500"
            }`}>
              {length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        {...props}
        ref={ref}
        id={textareaId}
        rows={rows}
        value={value}
        maxLength={maxLength}
        required={required}
        aria-invalid={Boolean(error || over)}
        className={`w-full resize-y rounded-2xl border bg-white px-5 py-3.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
          error || over
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 focus:border-green-700 focus:ring-green-200"
        }`}
      />

      {error ? (
        <p className="mt-1.5 px-2 text-xs text-red-600">{error}</p>
      ) : (
        hint && (
          <p className="mt-1.5 px-2 text-xs text-slate-500">{hint}</p>
        )
      )}
    </div>
  );
});

export default Textarea;
