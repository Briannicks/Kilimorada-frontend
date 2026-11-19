
import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    type = "text",
    id,
    required,
    className = "",
    inputClassName = "",
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-semibold text-slate-800"
        >
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={isPassword && showPassword ? "text" : type}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
              ? `${inputId}-hint`
              : undefined
          }
          className={`h-12 w-full rounded-full border bg-white px-5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-green-700 focus:ring-green-200"
          } ${isPassword ? "pr-12" : ""} ${inputClassName}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 px-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${inputId}-hint`}
            className="mt-1.5 px-2 text-xs text-slate-500"
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
});

export default Input;
