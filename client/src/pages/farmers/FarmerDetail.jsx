import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowLeft, CalendarDays, ClipboardPlus, MapPin, Pencil, Phone, Sprout, Trash2, UserX,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Badge, { StatusBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Skeleton from "../../components/ui/Skeleton";
import FarmerForm from "./FarmerForm";
import { deleteFarmer, getFarmer } from "../../api/farmers";
import { createReport } from "../../api/reports";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import { applyApiErrors } from "../../utils/forms";
import { capitalize, formatDate, timeAgo } from "../../utils/format";
import { REPORT_CATEGORIES } from "../../constants";

const reportSchema = Yup.object({
  category: Yup.string().oneOf(REPORT_CATEGORIES.map((c) => c.value)).required("Choose a category"),
  description: Yup.string().trim().min(3, "Describe the problem").required("Describe the problem"),
});

// Log a problem a farmer reported by phone call or in person
function LogReportModal({ open, farmer, onClose, onSaved }) {
  const formik = useFormik({
    initialValues: { category: "pest", description: "" },
    validationSchema: reportSchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const report = await createReport({
          farmer_id: farmer.id,
          category: values.category,
          description: values.description.trim(),
        });
        helpers.resetForm();
        onSaved(report);
      } catch (error) {
        applyApiErrors(error, helpers);
      }
    },
  });

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      icon={ClipboardPlus}
      title="Log a report"
      description={`For a problem ${farmer?.name || "this farmer"} reported by phone or in person.`}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="log-report-form" loading={formik.isSubmitting}>
            Save report
          </Button>
        </>
      }
    >
      <form id="log-report-form" onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <ErrorAlert message={formik.status} />
        <Select
          label="Category"
          options={REPORT_CATEGORIES}
          {...formik.getFieldProps("category")}
          error={(formik.touched.category && formik.errors.category) || undefined}
        />
        <Textarea
          label="What is the problem?"
          name="description"
          rows={4}
          value={formik.values.description}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={(formik.touched.description && formik.errors.description) || undefined}
        />
      </form>
    </Modal>
  );
}

function InfoItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-slate-800">{children}</div>
      </div>
    </div>
  );
}

export default function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: farmer, setData: setFarmer, loading, error, reload } = useFetch(() => getFarmer(id), [id]);
  const reports = farmer?.reports || [];

  const handleSaved = (saved) => {
    setEditOpen(false);
    setFarmer((current) => ({ ...current, ...saved }));
    toast.success("Farmer updated");
  };

  const handleReportSaved = (report) => {
    setReportOpen(false);
    toast.success("Report saved");
    navigate(`/reports/${report.id}`);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteFarmer(farmer.id);
      toast.success(`${farmer.name} deleted`);
      navigate("/farmers", { replace: true });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const backLink = (
    <Link to="/farmers" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
      <ArrowLeft className="h-4 w-4" /> All farmers
    </Link>
  );

  if (loading && !farmer) {
    return (
      <div className="space-y-6">
        {backLink}
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    const notFound = error === "Not found";
    return (
      <div className="space-y-6">
        {backLink}
        {notFound ? (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <EmptyState
              icon={UserX}
              title="Farmer not found"
              message="This farmer may have been deleted."
              action={<Button onClick={() => navigate("/farmers")}>Back to farmers</Button>}
            />
          </div>
        ) : (
          <ErrorAlert message={error} onRetry={reload} />
        )}
      </div>
    );
  }

  if (!farmer) return null;

  return (
    <div className="space-y-6">
      {backLink}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{farmer.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {farmer.registered_via === "ussd" ? (
              <Badge tone="green">Registered on USSD</Badge>
            ) : (
              <Badge tone="gray">Added on the web</Badge>
            )}
            <span className="text-sm text-slate-500">
              {reports.length} {reports.length === 1 ? "report" : "reports"}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button icon={ClipboardPlus} onClick={() => setReportOpen(true)}>
            Log report
          </Button>
          {isAdmin && (
            <Button variant="ghost" icon={Trash2} onClick={() => setConfirmDelete(true)} className="text-red-600 hover:bg-red-50">
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Details */}
      <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4 sm:p-6">
        <InfoItem icon={Phone} label="Phone">
          <a href={`tel:${farmer.phone}`} className="text-green-700 hover:underline">
            {farmer.phone}
          </a>
        </InfoItem>
        <InfoItem icon={MapPin} label="Area">
          {[farmer.ward, farmer.county].filter(Boolean).join(", ") || "Not set"}
        </InfoItem>
        <InfoItem icon={Sprout} label="Main crop">
          {farmer.main_crop || "Not set"}
        </InfoItem>
        <InfoItem icon={CalendarDays} label="Registered">
          {formatDate(farmer.created_at)}
        </InfoItem>
      </section>

      {/* Reports */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">Reports from this farmer</h3>
        </div>
        {reports.length === 0 ? (
          <EmptyState
            icon={ClipboardPlus}
            title="No reports yet"
            message="Problems this farmer reports on USSD, or that you log here, will be listed."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {reports.map((report) => (
              <li key={report.id}>
                <Link to={`/reports/${report.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-green-50/50">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-800">{report.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="gray">{capitalize(report.category)}</Badge>
                      {report.description?.startsWith("Ask Expert:") && <Badge tone="green">Ask Expert</Badge>}
                      {report.reply && <span className="text-xs text-slate-500">Replied by {report.replied_by || "an officer"}</span>}
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

      <FarmerForm open={editOpen} farmer={farmer} onClose={() => setEditOpen(false)} onSaved={handleSaved} />
      <LogReportModal open={reportOpen} farmer={farmer} onClose={() => setReportOpen(false)} onSaved={handleReportSaved} />
      {isAdmin && (
        <ConfirmDialog
          open={confirmDelete}
          title="Delete farmer?"
          message={`${farmer.name} and all ${reports.length} of their reports will be permanently deleted. They will stop receiving SMS alerts.`}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}