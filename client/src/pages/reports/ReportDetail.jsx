import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bot, CheckCircle2, FileX, MapPin, Phone, Trash2, User } from "lucide-react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Badge, { StatusBadge } from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Skeleton from "../../components/ui/Skeleton";
import ReplyBox from "./ReplyBox";
import { deleteReport, getReport, updateReport } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import { capitalize, formatDateTime, timeAgo } from "../../utils/format";
import { REPORT_CATEGORIES, REPORT_STATUSES } from "../../constants";

const AI_PREFIX = "AI answer sent:";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: report, setData: setReport, loading, error, reload } = useFetch(() => getReport(id), [id]);

  // Change status or category straight from the dropdowns
  const changeField = async (field, value) => {
    if (!report || report[field] === value) return;
    setSaving(field);
    try {
      const updated = await updateReport(report.id, { [field]: value });
      setReport(updated);
      toast.success(field === "status" ? `Marked as ${value}` : `Category changed to ${capitalize(value)}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving("");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteReport(report.id);
      toast.success("Report deleted");
      navigate("/reports", { replace: true });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const backLink = (
    <Link to="/reports" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
      <ArrowLeft className="h-4 w-4" /> All reports
    </Link>
  );

  if (loading && !report) {
    return (
      <div className="space-y-6">
        {backLink}
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {backLink}
        {error === "Not found" ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmptyState
              icon={FileX}
              title="Report not found"
              message="This report may have been deleted."
              action={<Button onClick={() => navigate("/reports")}>Back to reports</Button>}
            />
          </div>
        ) : (
          <ErrorAlert message={error} onRetry={reload} />
        )}
      </div>
    );
  }

  if (!report) return null;

  const askExpert = report.description?.startsWith("Ask Expert:");
  const description = askExpert ? report.description.replace(/^Ask Expert:\s*/, "") : report.description;
  const aiReply = report.reply?.startsWith(AI_PREFIX);
  const replyText = aiReply ? report.reply.slice(AI_PREFIX.length).trim() : report.reply;

  return (
    <div className="space-y-6">
      {backLink}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Report #{report.id}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <Badge tone="gray">{capitalize(report.category)}</Badge>
            {askExpert && <Badge tone="green">Ask Expert</Badge>}
            <span className="text-sm text-slate-500" title={formatDateTime(report.created_at)}>
              Reported {timeAgo(report.created_at)}
            </span>
          </div>
        </div>
        {isAdmin && (
          <Button variant="ghost" icon={Trash2} onClick={() => setConfirmDelete(true)} className="text-red-600 hover:bg-red-50">
            Delete
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {askExpert ? "Farmer's question" : "What the farmer reported"}
            </h3>
            <p className="mt-3 whitespace-pre-line rounded-xl bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-800">
              {description}
            </p>
          </section>

          {report.reply && (
            <section className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-800">
                {aiReply ? <Bot className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {aiReply ? "Automatic AI answer sent by SMS" : `Reply sent by ${report.replied_by || "an officer"}`}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-800">{replyText}</p>
              {aiReply && (
                <p className="mt-3 text-xs text-green-800">
                  Check this answer. If it is wrong or incomplete, send a correction below.
                </p>
              )}
            </section>
          )}

          <ReplyBox report={report} onReplied={setReport} />
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Farmer</h3>
            {report.farmer ? (
              <div className="mt-3 space-y-3 text-sm">
                <Link
                  to={`/farmers/${report.farmer.id}`}
                  className="flex items-center gap-2 font-semibold text-slate-900 hover:text-green-700"
                >
                  <User className="h-4 w-4 text-slate-400" /> {report.farmer.name}
                </Link>
                <a href={`tel:${report.farmer.phone}`} className="flex items-center gap-2 text-green-700 hover:underline">
                  <Phone className="h-4 w-4 text-slate-400" /> {report.farmer.phone}
                </a>
                <p className="flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400" /> {report.farmer.ward || "Ward not set"}
                </p>
                <Link to={`/farmers/${report.farmer.id}`} className="inline-block text-sm font-semibold text-green-700 hover:underline">
                  View farmer and past reports
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Farmer details are not available.</p>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Manage</h3>
            <Select
              label="Status"
              options={REPORT_STATUSES}
              value={report.status}
              disabled={Boolean(saving)}
              onChange={(event) => changeField("status", event.target.value)}
              hint={saving === "status" ? "Saving..." : undefined}
            />
            <Select
              label="Category"
              options={REPORT_CATEGORIES}
              value={report.category}
              disabled={Boolean(saving)}
              onChange={(event) => changeField("category", event.target.value)}
              hint={saving === "category" ? "Saving..." : undefined}
            />
          </section>
        </div>
      </div>

      {isAdmin && (
        <ConfirmDialog
          open={confirmDelete}
          title="Delete report?"
          message={`Report #${report.id} from ${report.farmer?.name || "this farmer"} will be permanently deleted.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}