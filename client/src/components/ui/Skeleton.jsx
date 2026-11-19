
export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`}
      aria-hidden="true"
    />
  );
}

// Placeholder rows displayed while a list is loading
export function SkeletonRows({ rows = 5, cols = 4 }) {
  return (
    <div
      className="divide-y divide-slate-100"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-6 px-5 py-4"
        >
          {Array.from({ length: cols }).map((__, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-4 ${
                colIndex === 0 ? "w-1/4" : "flex-1"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
