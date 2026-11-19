import { useFormik } from "formik";
import * as Yup from "yup";
import { MessageSquare, Send } from "lucide-react";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { replyToReport } from "../../api/reports";
import { useToast } from "../../context/ToastContext";
import { applyApiErrors } from "../../utils/forms";
import { REPLY_LIMIT } from "../../constants";

const SMS_PREFIX = "KilimoRada: "; // the backend adds this to every reply
const SMS_LENGTH = 160;

const schema = Yup.object({
  message: Yup.string()
    .trim()
    .required("Write a reply to send")
    .max(REPLY_LIMIT, `Keep it to ${REPLY_LIMIT} characters`),
});

// Write a reply; the backend saves it, SMSes it to the farmer and marks the report resolved.
export default function ReplyBox({ report, onReplied }) {
  const toast = useToast();
  const hasReply = Boolean(report.reply);

  const formik = useFormik({
    initialValues: { message: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const updated = await replyToReport(report.id, values.message.trim());
        const sent = updated.sms?.sent ?? 0;
        if (sent > 0) {
          toast.success(`Reply sent by SMS to ${report.farmer?.name || "the farmer"}`);
        } else {
          toast.error("Reply saved, but the SMS could not be sent. Check the SMS settings.");
        }
        helpers.resetForm();
        onReplied(updated);
      } catch (error) {
        applyApiErrors(error, helpers);
      }
    },
  });

  const length = formik.values.message.trim().length;
  const smsCount = length ? Math.ceil((length + SMS_PREFIX.length) / SMS_LENGTH) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{hasReply ? "Send another reply" : "Reply to farmer"}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Sent by SMS to {report.farmer?.phone || "the farmer"}. The report is marked resolved.
            {hasReply && " This replaces the reply saved above."}
          </p>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="mt-4 space-y-3">
        <Textarea
          aria-label="Reply message"
          name="message"
          rows={5}
          maxLength={REPLY_LIMIT}
          placeholder="Write clear, practical advice the farmer can act on."
          value={formik.values.message}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={(formik.touched.message && formik.errors.message) || undefined}
        />
        <ErrorAlert message={formik.status} />
        <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            {smsCount > 0 ? `${smsCount} SMS ${smsCount === 1 ? "message" : "messages"}` : "Long replies are split into several SMS."}
          </p>
          <Button type="submit" icon={Send} loading={formik.isSubmitting}>
            Send reply by SMS
          </Button>
        </div>
      </form>
    </section>
  );
}