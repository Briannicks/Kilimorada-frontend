import { Link, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthLayout from "../../components/layout/AuthLayout";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { useAuth } from "../../context/AuthContext";
import { applyApiErrors } from "../../utils/forms";
import { COUNTY_OPTIONS, KENYA_COUNTIES } from "../../constants";

const schema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").max(100, "Too long").required("Full name is required"),
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
  county: Yup.string().oneOf(KENYA_COUNTIES, "Choose your county").required("Choose your county"),
  ward: Yup.string().trim().min(2, "Ward must be at least 2 characters").max(100, "Too long").required("Ward is required"),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Za-z]/, "Add at least one letter")
    .matches(/\d/, "Add at least one number")
    .matches(/[^A-Za-z0-9\s]/, "Add at least one symbol, e.g. ! @ # $")
    .matches(/^\S*$/, "Password cannot contain spaces"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

// Same rules as the server (server/models.py, password_problem)
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "A letter", test: (value) => /[A-Za-z]/.test(value) },
  { label: "A number", test: (value) => /\d/.test(value) },
  { label: "A symbol, e.g. ! @ # $", test: (value) => /[^A-Za-z0-9\s]/.test(value) },
];

function PasswordChecklist({ value }) {
  return (
    <ul className="-mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 px-1" aria-label="Password requirements">
      {PASSWORD_RULES.map(({ label, test }) => {
        const met = test(value);
        const Icon = met ? Check : X;
        return (
          <li key={label} className={`flex items-center gap-1.5 text-xs ${met ? "text-green-700" : "text-slate-400"}`}>
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
            <span className="sr-only">{met ? "(done)" : "(missing)"}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { name: "", email: "", county: "", ward: "", password: "", confirmPassword: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const result = await signup({
          name: values.name.trim(),
          email: values.email.trim(),
          county: values.county,
          ward: values.ward.trim(),
          password: values.password,
        });
        // The server emailed a code to confirm the email address
        navigate("/verify", { state: { message: result.message, purpose: "signup" } });
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
      subtitle="For extension officers. An admin approves new accounts."
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="County"
            placeholder="Choose county"
            options={COUNTY_OPTIONS}
            {...formik.getFieldProps("county")}
            error={fieldError("county")}
          />
          <Input
            label="Ward"
            placeholder="e.g. Tinet"
            {...formik.getFieldProps("ward")}
            error={fieldError("ward")}
          />
        </div>
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          {...formik.getFieldProps("password")}
          error={fieldError("password")}
        />
        <PasswordChecklist value={formik.values.password} />
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