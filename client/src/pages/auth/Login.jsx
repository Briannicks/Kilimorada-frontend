import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { useAuth } from "../../context/AuthContext";
import { applyApiErrors } from "../../utils/forms";

const schema = Yup.object({
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const result = await login({ email: values.email.trim(), password: values.password });
        if (result?.verification_required) {
          // Signed up but never confirmed the email: the server sent a new code
          navigate("/verify", { state: { message: result.message, purpose: "signup" } });
        } else if (result?.two_factor_required) {
          // Step 2: the server emailed a 6-digit login code
          navigate("/verify", { state: { message: result.message, purpose: "login" } });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        if (error.status === 403) {
          // Email verified, but an admin hasn't approved the account yet
          navigate("/pending", { state: { message: error.message } });
          return;
        }
        applyApiErrors(error, helpers);
      }
    },
  });

  const fieldError = (name) => (formik.touched[name] && formik.errors[name]) || undefined;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account."
      footer={
        <p>
          New to KilimoRada?{" "}
          <Link to="/signup" className="font-semibold text-green-700 underline underline-offset-4 hover:text-green-800">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          {...formik.getFieldProps("email")}
          error={fieldError("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...formik.getFieldProps("password")}
          error={fieldError("password")}
        />

        <ErrorAlert message={formik.status} />

        <Button type="submit" size="lg" fullWidth loading={formik.isSubmitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}