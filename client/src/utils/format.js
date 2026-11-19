// Small formatting helpers used across pages.

// The backend sends UTC times without a "Z", e.g. "2026-11-18T09:15:00".
// Adding "Z" makes the browser show them in local (Nairobi) time.
export function parseDate(value) {
  if (!value) return null;
  const text = /[zZ]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return "—";
  return date.toLocaleString("en-KE", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function timeAgo(value) {
  const date = parseDate(value);
  if (!date) return "—";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(value);
}

export function formatKES(amount) {
  if (amount === null || amount === undefined || amount === "") return "—";
  return `KES ${Number(amount).toLocaleString("en-KE")}`;
}

export function capitalize(text = "") {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

export function languageName(code) {
  return code === "sw" ? "Kiswahili" : "English";
}