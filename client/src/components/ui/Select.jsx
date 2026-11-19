
import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef(function Select(
  {
    label,
    error,
    hint,
    options = [],
    groups,
    placeholder,
    id,
    required,
    className = "",
    ...props
  },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  const renderOptions = (list) =>
    list.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-semibold text-slate-800"
        >
          {label}
          {required && <span className="ml-0.5 text-red-600">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${selectId}-error`
              : hint
              ? `${selectId}-hint`
              : undefined
          }
          className={`h-12 w-full appearance-none rounded-full border bg-white pl-5 pr-11 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200 focus:border-green-700 focus:ring-green-200"
          }`}
          {...props}
        >
          {placeholder !== undefined && (
            <option value="">{placeholder}</option>
          )}

          {groups
            ? groups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {renderOptions(group.options)}
                </optgroup>
              ))
            : renderOptions(options)}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {error ? (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 px-2 text-xs text-red-600"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${selectId}-hint`}
            className="mt-1.5 px-2 text-xs text-slate-500"
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
});

export default Select;
