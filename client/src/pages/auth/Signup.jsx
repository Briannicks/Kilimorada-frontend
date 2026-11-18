import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { applyApiErrors } from "../../utils/forms";

const schema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").max(100, "Too long").required("Full name is required"),
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

export default function Signup() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const user = await signup({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        toast.success(
          user.role === "admin"
            ? "Account created. You are the first user, so you are the admin."
            : "Account created. Welcome to KilimoRada."
        );
        navigate("/dashboard", { replace: true });
      } catch (error) {
        applyApiErrors(error, helpers);
        // 409 = email already used: show it under the email field too
        if (error.status === 409) helpers.setFieldError("email", error.message);
      }
    },
  });

  const fieldError = (name) => (formik.touched[name] && formik.errors[name]) || undefined;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="For extension officers and admins."
      footer={
        <p>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-green-700 underline underline-offset-4 hover:text-green-800">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Input
          label="Full name"
          autoComplete="name"
          autoFocus
          {...formik.getFieldProps("name")}
          error={fieldError("name")}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...formik.getFieldProps("email")}
          error={fieldError("email")}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters."
          {...formik.getFieldProps("password")}
          error={fieldError("password")}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          {...formik.getFieldProps("confirmPassword")}
          error={fieldError("confirmPassword")}
        />

        <ErrorAlert message={formik.status} />

        <Button type="submit" size="lg" fullWidth loading={formik.isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}