import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Megaphone, Send } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import Table from "../../components/ui/Table";
import Pagination from "../../components/ui/Pagination";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorAlert from "../../components/ui/ErrorAlert";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { getBroadcasts, sendBroadcast } from "../../api/broadcasts";
import { useToast } from "../../context/ToastContext";
import useFetch from "../../hooks/useFetch";
import { applyApiErrors } from "../../utils/forms";
import { formatDateTime } from "../../utils/format";
import { CROP_SUGGESTIONS, PER_PAGE, SMS_LIMIT } from "../../constants";

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All registered farmers" },
  { value: "crop", label: "Farmers growing one crop" },
];

const schema = Yup.object({
  message: Yup.string()
    .trim()
    .required("Write the message to send")
    .max(SMS_LIMIT, `Keep it to ${SMS_LIMIT} characters (one SMS)`),
  audience: Yup.string().oneOf(["all", "crop"]).required(),
  crop: Yup.string()
    .trim()
    .when("audience", {
      is: "crop",
      then: (rule) => rule.required("Type the crop, e.g. Maize"),
    }),
});

export default function Broadcasts() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState(null); // values waiting for confirmation

  const { data, loading, error, reload } = useFetch(() => getBroadcasts({ page, per_page: PER_PAGE }), [page]);
  const broadcasts = data?.items || [];

  const formik = useFormik({
    initialValues: { message: "", audience: "all", crop: "" },
    validationSchema: schema,
    // Submitting only opens the confirm dialog; the SMS is sent from confirmSend().
    // FIX: this handler is not async, so Formik left isSubmitting stuck on true. That kept the
    // dialog's "Send now" button disabled with a spinner, so the broadcast could never be sent.
    onSubmit: (values, helpers) => {
      helpers.setSubmitting(false);
      helpers.setStatus(null);
      setPending(values);
    },
  });

  const confirmSend = async () => {
    formik.setSubmitting(true);
    try {
      const result = await sendBroadcast({
        message: pending.message.trim(),
        targetCrop: pending.audience === "crop" ? pending.crop.trim() : null,
      });
      const sent = result.sms?.sent ?? result.recipient_count;
      const failed = result.sms?.failed ?? 0;

      if (failed > 0 && sent === 0) {
        toast.error("The broadcast was saved, but no SMS could be sent. Check the SMS settings.");
      } else if (failed > 0) {
        toast.success(`Sent to ${sent} farmers. ${failed} could not be reached.`);
      } else {
        toast.success(`Sent to ${sent} ${sent === 1 ? "farmer" : "farmers"}.`);
      }

      formik.resetForm();
      setPending(null);
      if (page !== 1) setPage(1);
      else reload();
    } catch (err) {
      setPending(null);
      applyApiErrors(err, formik);
    } finally {
      formik.setSubmitting(false);
    }
  };

  const audienceText = (values) =>
    values?.audience === "crop" && values.crop.trim()
      ? `all farmers growing ${values.crop.trim()}`
      : "all registered farmers";

  const fieldError = (name) => (formik.touched[name] && formik.errors[name]) || undefined;

  const columns = [
    {
      key: "message",
      header: "Message",
      className: "max-w-md",
      render: (row) => <p className="whitespace-pre-line text-slate-800">{row.message}</p>,
    },
    {
      key: "target_crop",
      header: "Audience",
      // FIX: the API sends null for "all farmers", so the badge used to be empty
      render: (row) => (
        <Badge tone={row.target_crop ? "green" : "gray"}>{row.target_crop || "All farmers"}</Badge>
      ),
    },
    {
      key: "recipient_count",
      header: "Sent to",
      render: (row) => `${row.recipient_count.toLocaleString()} ${row.recipient_count === 1 ? "farmer" : "farmers"}`,
    },
    { key: "sender", header: "Sent by", render: (row) => row.sender || "—", hideOnMobile: true },
    { key: "created_at", header: "Date", render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Broadcasts</h2>
        <p className="mt-1 text-sm text-slate-500">
          Send one SMS alert to farmers, for example a pest warning or weather advice.
        </p>
      </div>

      {/* Compose */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-base font-semibold text-slate-900">New broadcast</h3>
        <form onSubmit={formik.handleSubmit} noValidate className="mt-4 space-y-4">
          <Textarea
            label="Message"
            name="message"
            rows={4}
            maxLength={SMS_LIMIT}
            placeholder="e.g. Fall armyworm reported in Tinet. Check your maize this week."
            value={formik.values.message}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("message")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Send to"
              options={AUDIENCE_OPTIONS}
              {...formik.getFieldProps("audience")}
            />
            {formik.values.audience === "crop" && (
              <div>
                <Input
                  label="Crop"
                  list="broadcast-crops"
                  placeholder="e.g. Maize"
                  hint="Matches the main crop farmers registered with."
                  {...formik.getFieldProps("crop")}
                  error={fieldError("crop")}
                />
                <datalist id="broadcast-crops">
                  {CROP_SUGGESTIONS.map((crop) => (
                    <option key={crop} value={crop} />
                  ))}
                </datalist>
              </div>
            )}
          </div>

          <ErrorAlert message={formik.status} />

          <div className="flex justify-end">
            <Button type="submit" icon={Send} loading={formik.isSubmitting}>
              Send broadcast
            </Button>
          </div>
        </form>
      </section>

      {/* History */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">History</h3>
        </div>
        {loading && !data ? (
          <SkeletonRows rows={4} cols={4} />
        ) : error ? (
          <div className="p-5">
            <ErrorAlert message={error} onRetry={reload} />
          </div>
        ) : broadcasts.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No broadcasts yet"
            message="Messages you send to farmers will be listed here."
          />
        ) : (
          <>
            <Table columns={columns} rows={broadcasts} />
            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onPageChange={setPage}
              label={data.total === 1 ? "broadcast" : "broadcasts"}
            />
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pending)}
        danger={false}
        title="Send this SMS?"
        message={
          pending
            ? `"${pending.message.trim()}" will be sent to ${audienceText(pending)}. This cannot be undone.`
            : ""
        }
        confirmLabel="Send now"
        loading={formik.isSubmitting}
        onConfirm={confirmSend}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}