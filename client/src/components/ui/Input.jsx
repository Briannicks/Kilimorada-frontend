import { forwardRef, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Works with Formik: <Input label="Email" {...formik.getFieldProps("email")} error={...} />
const Input = forwardRef(function Input(
  { label, error, hint, type = "text", id, required, className = "", inputClassName = "", ...props },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";