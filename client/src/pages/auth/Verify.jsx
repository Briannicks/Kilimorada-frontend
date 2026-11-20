import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { resendCode } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const RESEND_WAIT_SECONDS = 30;

const schema = Yup.object({
  code: Yup.string()
    .matches(/^\d{6}$/, "Enter the 6-digit code from your email")
    .required("Enter the 6-digit code from your email"),
});

// Used twice: to confirm a new account's email (purpose "signup")
// and for the second step of login (purpose "login").
export default function Verify() {
  const { verify } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = location.state?.purpose === "signup";

  const [message, setMessage] = useState(location.state?.message || "Enter the 6-digit code we sent to your email.");
  const [wait, setWait] = useState(RESEND_WAIT_SECONDS);
  const [resending, setResending] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);

  // Countdown before "Resend code" can be used again
  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const formik = useFormik({
    initialValues: { code: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const result = await verify(values.code);
        if (result?.pending_approval) {
          // New officer: email confirmed, now an admin has to approve them
          navigate("/pending", { replace: true, state: { message: result.message } });
          return;
        }
        if (isSignup) toast.success("Email verified. You are the admin of this KilimoRada.");
        navigate("/dashboard", { replace: true });
      } catch (error) {
        if (error.status === 429) {
          // Too many wrong codes: the server cancelled this attempt
          toast.error(error.message);
          navigate("/login", { replace: true });
          return;
        }
        if (error.status === 403) {
          navigate("/pending", { replace: true, state: { message: error.message } });
          return;
        }
        if (error.status === 401 && error.message.startsWith("Your session")) setNeedsLogin(true);
        helpers.setStatus(error.message);
        helpers.setFieldValue("code", "", false);
      }
    },
  });

  const handleResend = async () => {
    setResending(true);
    formik.setStatus(null);
    try {
      const result = await resendCode();
      setMessage(result.message);
      setWait(RESEND_WAIT_SECONDS);
      toast.success("A new code has been sent.");
    } catch (error) {
      if (error.status === 401) setNeedsLogin(true);
      formik.setStatus(error.message);
    } finally {
      setResending(false);
    }
  };

  // Keep only digits, max 6
  const handleCodeChange = (event) => {
    formik.setFieldValue("code", event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <AuthLayout
      title={isSignup ? "Verify your email" : "Check your email"}
      subtitle={message}
      footer={
        <Link to="/login" className="font-semibold text-green-700 underline underline-offset-4 hover:text-green-800">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Input
          label="Verification code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="000000"
          value={formik.values.code}
          onChange={handleCodeChange}
          onBlur={formik.handleBlur}
          error={(formik.touched.code && formik.errors.code) || undefined}
          inputClassName="text-center text-xl font-semibold tracking-[0.5em]"
        />

        <ErrorAlert message={formik.status} />

        {needsLogin ? (
          <Button size="lg" fullWidth onClick={() => navigate("/login", { replace: true })}>
            Sign in again
          </Button>
        ) : (
          <Button type="submit" size="lg" fullWidth loading={formik.isSubmitting}>
            Verify
          </Button>
        )}

        {!needsLogin && (
          <p className="text-center text-sm text-slate-500">
            Didn&apos;t get it? Check your spam folder, or{" "}
            {wait > 0 ? (
              <span>resend in {wait}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-semibold text-green-700 hover:underline disabled:opacity-50"
              >
                {resending ? "sending..." : "resend the code"}
              </button>
            )}
          </p>
        )}
      </form>
    </AuthLayout>
  );
}