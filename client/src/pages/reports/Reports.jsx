import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Inbox, MapPin, Search, X } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Pagination from "../../components/ui/Pagination";
import Badge, { StatusBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { getReports } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import { capitalize, timeAgo } from "../../utils/format";
import { PER_PAGE, REPORT_CATEGORIES } from "../../constants";

const TABS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

const CATEGORY_TONES = { pest: "red", disease: "amber", weather: "gray", other: "gray" };

export default function Reports() {
  const { user } = useAuth();
  const myWard = user?.ward || "";
  const [scope, setScope] = useState(myWard ? "mine" : "all"); // "mine" = farmers in my ward
  const [status, setStatus] = useState("open");
  const [category, setCategory] = useState("");
  const [ward, setWard] = useState("");
  const [page, setPage] = useState(1);
  const debouncedWard = useDebounce(ward.trim());
  const wardFilter = scope === "mine" ? myWard : debouncedWard;

  const { data, loading, error, reload } = useFetch(
    () => getReports({ status, category, ward: wardFilter, page, per_page: PER_PAGE }),
    [status, category, wardFilter, page]
  );

  // Totals for the two tabs
  const counts = useFetch(
    () =>
      Promise.all([
        getReports({ status: "open", ward: scope === "mine" ? myWard : "", per_page: 1 }),
        getReports({ status: "resolved", ward: scope === "mine" ? myWard : "", per_page: 1 }),
      ]).then(([open, resolved]) => ({ open: open.total, resolved: resolved.total })),
    [scope, myWard]
  );

  const reports = data?.items || [];
  const filtering = Boolean(category || (scope === "all" && ward));

  const changeScope = (value) => {
    setScope(value);
    setWard("");
    setPage(1);
  };

  const changeTab = (value) => {
    setStatus(value);
    setPage(1);
  };

  const clearFilters = () => {
    setCategory("");
    setWard("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Farmer reports</h2>
        <p className="mt-1 text-sm text-slate-500">
          Problems farmers reported on USSD or by phone. Open a report to reply by SMS.
        </p>
      </div>

      {/* My ward / all reports */}
      {myWard && (
        <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          {[
            { value: "mine", label: `My ward (${myWard})`, icon: MapPin },
            { value: "all", label: "All reports" },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => changeScope(value)}
              aria-pressed={scope === value}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                scope === value ? "bg-green-700 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200" role="tablist">
        {TABS.map((tab) => {
          const active = status === tab.value;
          const count = counts.data?.[tab.value];
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeTab(tab.value)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                active ? "border-green-700 text-green-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
              {count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    active ? "bg-green-700 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Select
          aria-label="Filter by category"
          placeholder="All categories"
          options={REPORT_CATEGORIES}
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(1);
          }}
        />
        {scope === "all" ? (
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label="Filter by ward"
              placeholder="Ward, e.g. Tinet"
              value={ward}
              onChange={(event) => {
                setWard(event.target.value);
                setPage(1);
              }}
              inputClassName="pl-11"
            />
          </div>
        ) : (
          <p className="flex h-12 items-center gap-2 px-1 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-green-700" aria-hidden="true" />
            Showing farmers in {myWard}. Change your ward on your Profile.
          </p>
        )}
        {filtering ? (
          <Button variant="ghost" icon={X} onClick={clearFilters}>
            Clear
          </Button>
        ) : (
          <span className="hidden sm:block sm:w-20" />
        )}
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && !data ? (
          <SkeletonRows rows={6} cols={3} />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={reload} />
          </div>
        ) : reports.length === 0 ? (
          filtering ? (
            <EmptyState
              icon={Search}
              title="No reports match"
              message="Try a different category or ward."
              action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={Inbox}
              title={
                status === "open"
                  ? scope === "mine" ? `No open reports in ${myWard}` : "No open reports"
                  : "No resolved reports yet"
              }
              message={
                status === "open"
                  ? "All caught up. New problems farmers report on USSD will appear here."
                  : "Reports you reply to will move here."
              }
            />
          )
        ) : (
          <div className={loading ? "opacity-60 transition-opacity" : ""}>
            <ul className="divide-y divide-slate-100">
              {reports.map((report) => {
                const askExpert = report.description?.startsWith("Ask Expert:");
                return (
                  <li key={report.id}>
                    <Link
                      to={`/reports/${report.id}`}
                      className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-green-50/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-semibold text-slate-900">{report.farmer?.name || "Unknown farmer"}</span>
                          <span className="text-sm text-slate-500">
                            {report.farmer?.phone}
                            {report.farmer?.ward && ` · ${report.farmer.ward}`}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-sm text-slate-700">
                          {askExpert ? report.description.replace(/^Ask Expert:\s*/, "") : report.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone={CATEGORY_TONES[report.category] || "gray"}>{capitalize(report.category)}</Badge>
                          {askExpert && <Badge tone="green">Ask Expert</Badge>}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="text-xs text-slate-400">{timeAgo(report.created_at)}</span>
                        <StatusBadge status={report.status} />
                        <ChevronRight className="hidden h-4 w-4 text-slate-300 sm:block" aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              label={data.total === 1 ? "report" : "reports"}
            />
          </div>
        )}
      </div>
    </div>
  );
}