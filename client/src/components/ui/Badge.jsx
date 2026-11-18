const TONES = {
  green: "bg-green-50 text-green-800 border-green-200",
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-800 border-amber-200",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
  solid: "bg-green-700 text-white border-green-700",
};

export default function Badge({ children, tone = "gray", dot = false, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}