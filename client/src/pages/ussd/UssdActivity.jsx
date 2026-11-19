import { useState } from "react";
import { Bot, ShieldAlert, Smartphone } from "lucide-react";
import Select from "../../components/ui/Select";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import Skeleton, { SkeletonRows } from "../../components/ui/Skeleton";
import { getUssdStats } from "../../api/dashboard";
import { getAiQuestions, getInputReports } from "../../api/registry";
import useFetch from "../../hooks/useFetch";
import { formatDateTime, languageName } from "../../utils/format";
import { PER_PAGE } from "../../constants";

const TABS = [
  { value: "reports", label: "Fake input reports", icon: ShieldAlert },
  { value: "questions", label: "Ask Expert questions", icon: Bot },
];

const KIND_OPTIONS = [
  { value: "batch_code", label: "Fake batch codes" },
  { value: "scam_number", label: "Scam phone numbers" },
];

function FakeReports() {
  const [kind, setKind] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(
    () => getInputReports({ kind, page, per_page: PER_PAGE }),
    [kind, page]
  );
  const reports = data?.items || [];

  const columns = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => <span className="font-mono text-sm font-semibold text-slate-900">{row.reference}</span>,
    },
    {
      key: "kind",
      header: "Type",
      render: (row) =>
        row.kind === "batch_code" ? <Badge tone="amber">Batch code</Badge> : <Badge tone="red">Scam number</Badge>,
    },
    {
      key: "value",
      header: "Reported code or number",
      render: (row) => <span className="font-mono font-semibold tracking-wide text-slate-900">{row.value}</span>,
    },
    { key: "reported_by", header: "Reported by", hideOnMobile: true },
    { key: "created_at", header: "Date", render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Reported by farmers on USSD option 8. A batch code with 3 reports shows as FAKE on option 9.
        </p>
        <div className="w-full sm:w-56">
          <Select
            aria-label="Filter by type"
            placeholder="All types"
            options={KIND_OPTIONS}
            value={kind}
            onChange={(event) => {
              setKind(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {loading && !data ? (
        <SkeletonRows rows={5} cols={4} />
      ) : error ? (
        <div className="p-5">
          <ErrorAlert message={error} onRetry={reload} />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title={kind ? "Nothing of this type yet" : "No fake inputs reported yet"}
          message="When farmers report a fake batch code or a scam number on USSD, it will appear here."
        />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <Table columns={columns} rows={reports} />
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
  );
}

function AskExpertQuestions() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useFetch(() => getAiQuestions({ page, per_page: PER_PAGE }), [page]);
  const questions = data?.items || [];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="text-sm text-slate-500">
          Questions farmers asked on USSD option 5, and the AI answer they received by SMS. Questions from registered
          farmers also appear in Reports so an officer can follow up.
        </p>
      </div>
      {loading && !data ? (
        <SkeletonRows rows={5} cols={3} />
      ) : error ? (
        <div className="p-5">
          <ErrorAlert message={error} onRetry={reload} />
        </div>
      ) : questions.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No questions yet"
          message="Questions farmers ask the AI expert on USSD will appear here."
        />
      ) : (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <ul className="divide-y divide-slate-100">
            {questions.map((question) => (
              <li key={question.id} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="font-mono">{question.phone}</span>
                    <Badge tone="gray">{languageName(question.language)}</Badge>
                  </span>
                  <span>{formatDateTime(question.created_at)}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                {question.answer ? (
                  <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-green-800">
                      <Bot className="h-3.5 w-3.5" /> Answer sent by SMS
                    </p>
                    <p className="mt-1 text-sm text-slate-800">{question.answer}</p>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-400">Waiting for the answer...</p>
                )}
              </li>
            ))}
          </ul>
          <Pagination
            page={data.page}
            pages={data.pages}
            total={data.total}
            onPageChange={setPage}
            label={data.total === 1 ? "question" : "questions"}
          />
        </div>
      )}
    </div>
  );
}

export default function UssdActivity() {
  const [tab, setTab] = useState("reports");
  const stats = useFetch(() => getUssdStats(), []);

  const summary = [
    { label: "Phones used", value: stats.data?.ussd_users },
    { label: "Questions asked", value: stats.data?.ai_questions },
    { label: "Fake input reports", value: stats.data?.fake_input_reports },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">USSD activity</h2>
        <p className="mt-1 text-sm text-slate-500">What farmers are doing on the USSD menu. Phone numbers are partly hidden.</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-700">
              <Smartphone className="h-5 w-5" />
            </span>
            <div>
              {stats.loading && !stats.data ? (
                <Skeleton className="h-7 w-14" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">{(item.value || 0).toLocaleString()}</p>
              )}
              <p className="text-sm text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
      {stats.error && <ErrorAlert message={stats.error} onRetry={stats.reload} />}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200" role="tablist">
        {TABS.map(({ value, label, icon: Icon }) => {
          const active = tab === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(value)}
              className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition-colors ${
                active ? "border-green-700 text-green-700" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "reports" ? <FakeReports /> : <AskExpertQuestions />}
    </div>
  );
}