
import Skeleton from "./Skeleton";

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading = false
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>

        {Icon && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
            <Icon
              className="h-[18px] w-[18px]"
              aria-hidden="true"
            />
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-8 w-20" />
      ) : (
        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {typeof value === "number"
            ? value.toLocaleString()
            : value ?? "0"}
        </p>
      )}

      {hint && !loading && (
        <p className="mt-1 text-sm text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

