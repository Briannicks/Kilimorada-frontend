import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle, CheckCircle2, Megaphone, MessageSquare, Plus, ShieldAlert,
  Smartphone, TrendingUp, Users,
} from "lucide-react";
import Button from "../../components/ui/Button";
import StatCard from "../../components/ui/StatCard";
import Badge, { StatusBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import Skeleton, { SkeletonRows } from "../../components/ui/Skeleton";
import { getDashboard, getUssdStats } from "../../api/dashboard";
import { useAuth } from "../../context/AuthContext";
import useFetch from "../../hooks/useFetch";
import { capitalize, timeAgo } from "../../utils/format";
import { REPORT_CATEGORIES } from "../../constants";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Simple horizontal bars, no chart library needed
function CategoryBars({ counts }) {
  const total = REPORT_CATEGORIES.reduce((sum, c) => sum + (counts?.[c.value] || 0), 0);

  if (total === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">No reports from farmers yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {REPORT_CATEGORIES.map(({ value, label }) => {
        const count = counts?.[value] || 0;
        const percent = Math.round((count / total) * 100);
        return (
          <li key={value}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{label}</span>
              <span className="text-slate-500">
                <span className="font-semibold text-slate-900">{count}</span> · {percent}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-green-700" style={{ width: `${percent}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const summary = useFetch(() => getDashboard(), []);
  const ussd = useFetch(() => getUssdStats(), []);

  const stats = summary.data;
  const ussdStats = ussd.data;
  const loadingStats = summary.loading && !stats;
  const recentReports = stats?.recent_reports || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {greeting()}, {user?.name?.split(" ")[0]}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Here is what is happening with farmers on KilimoRada.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Megaphone} onClick={() => navigate("/broadcasts")}>
            Send broadcast
          </Button>
          <Button icon={Plus} onClick={() => navigate("/prices")}>
            Add market price
          </Button>
        </div>
      </div>

      {summary.error && <ErrorAlert message={summary.error} onRetry={summary.reload} />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Farmers" value={stats?.total_farmers} icon={Users} loading={loadingStats} />
        <StatCard label="Open reports" value={stats?.open_reports} icon={AlertCircle} loading={loadingStats} />
        <StatCard label="Resolved" value={stats?.resolved_reports} icon={CheckCircle2} loading={loadingStats} />
        <StatCard label="Prices posted" value={stats?.market_prices} icon={TrendingUp} loading={loadingStats} />
        <StatCard label="Broadcasts" value={stats?.broadcasts_sent} icon={Megaphone} loading={loadingStats} />
        <StatCard label="SMS sent" value={stats?.sms_sent} icon={MessageSquare} loading={loadingStats} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left: categories + recent reports */}
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Reports by category">
            {loadingStats ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <CategoryBars counts={stats?.reports_by_category} />
            )}
          </Panel>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">Recent farmer reports</h3>
              {recentReports.length > 0 && (
                <Link to="/reports" className="text-sm font-semibold text-green-700 hover:underline">
                  View all
                </Link>
              )}
            </div>
            {loadingStats ? (
              <SkeletonRows rows={4} cols={3} />
            ) : recentReports.length === 0 ? (
              <EmptyState
                icon={AlertCircle}
                title="No reports yet"
                message="When farmers report a problem on USSD, it will appear here."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentReports.map((report) => (
                  <li key={report.id}>
                    <Link
                      to={`/reports/${report.id}`}
                      className="flex items-start gap-4 px-5 py-4 hover:bg-green-50/50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{report.farmer?.name || "Unknown farmer"}</span>
                          {report.farmer?.ward && <span className="text-sm text-slate-500">· {report.farmer.ward}</span>}
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-600">{report.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge tone="gray">{capitalize(report.category)}</Badge>
                          {report.description?.startsWith("Ask Expert:") && <Badge tone="green">Ask Expert</Badge>}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <StatusBadge status={report.status} />
                        <span className="text-xs text-slate-400">{timeAgo(report.created_at)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Right: USSD activity */}
        <Panel
          title="USSD activity"
          action={
            <Link to="/ussd-activity" className="text-sm font-semibold text-green-700 hover:underline">
              Details
            </Link>
          }
        >
          {ussd.error ? (
            <ErrorAlert message={ussd.error} onRetry={ussd.reload} />
          ) : ussd.loading && !ussdStats ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/60 py-3 text-center">
                <div>
                  <p className="text-xl font-bold text-slate-900">{(ussdStats?.ussd_users || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Phones</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{(ussdStats?.ai_questions || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Questions</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-600">{(ussdStats?.fake_input_reports || 0).toLocaleString()}</p>
                  <p className="text-xs text-slate-500">Fake reports</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link to="/batch-codes" className="rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
                  <span className="block font-semibold text-slate-900">{ussdStats?.batch_codes_registered || 0}</span>
                  <span className="text-slate-500">Batch codes</span>
                </Link>
                <Link to="/agrovets" className="rounded-xl border border-slate-200 px-3 py-2.5 hover:bg-slate-50">
                  <span className="block font-semibold text-slate-900">{ussdStats?.verified_agrovets || 0}</span>
                  <span className="text-slate-500">Agrovets</span>
                </Link>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Most reported</h4>
                {ussdStats?.most_reported?.length ? (
                  <ul className="space-y-2">
                    {ussdStats.most_reported.map((item) => (
                      <li
                        key={`${item.kind}-${item.value}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-sm font-semibold text-slate-900">{item.value}</p>
                          <p className="text-xs text-slate-500">
                            {item.kind === "batch_code" ? "Batch code" : "Scam number"} · {item.reports}{" "}
                            {item.reports === 1 ? "report" : "reports"}
                          </p>
                        </div>
                        {item.flagged ? (
                          <Badge tone="red">Flagged</Badge>
                        ) : (
                          <Badge tone="amber">Watching</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-3 py-4 text-sm text-slate-500">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    No fake inputs reported yet.
                  </div>
                )}
              </div>

              <p className="flex items-center gap-2 text-xs text-slate-400">
                <Smartphone className="h-3.5 w-3.5" />
                Codes are flagged as fake after 3 farmer reports.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}