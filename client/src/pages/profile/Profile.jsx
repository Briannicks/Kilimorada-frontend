import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Camera, CalendarDays, Mail, ShieldCheck, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { updateProfile } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { applyApiErrors } from "../../utils/forms";
import { capitalize, formatDate } from "../../utils/format";
import { COUNTY_OPTIONS, KENYA_COUNTIES } from "../../constants";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB, same limit as the server

const schema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").max(100, "Too long").required("Name is required"),
  county: Yup.string().oneOf(KENYA_COUNTIES, "Choose your county").required("Choose your county"),
  ward: Yup.string().trim().min(2, "Ward must be at least 2 characters").max(100, "Too long").required("Ward is required"),
});

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <span className="w-24 shrink-0 text-sm text-slate-500">{label}</span>
      <span className="min-w-0 truncate text-sm font-medium text-slate-800">{children}</span>
    </div>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const fileInput = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileError, setFileError] = useState("");

  // Show the chosen photo before it is uploaded, and free the memory afterwards
  useEffect(() => {
    if (!avatarFile) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: user?.name || "", county: user?.county || "", ward: user?.ward || "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      try {
        const updated = await updateProfile({
          name: values.name.trim(),
          county: values.county,
          ward: values.ward.trim(),
          avatarFile,
        });
        setUser(updated); // updates the name and photo in the top bar too
        setAvatarFile(null);
        if (fileInput.current) fileInput.current.value = "";
        toast.success("Profile updated");
      } catch (error) {
        applyApiErrors(error, helpers);
      }
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    setFileError("");
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError("Choose a PNG, JPG or WEBP image.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError("The image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }
    setAvatarFile(file);
  };

  const removeChosenFile = () => {
    setAvatarFile(null);
    setFileError("");
    if (fileInput.current) fileInput.current.value = "";
  };

  if (!user) return null;

  const detailsChanged =
    formik.values.name.trim() !== user.name ||
    formik.values.county !== (user.county || "") ||
    formik.values.ward.trim() !== (user.ward || "");
  const hasChanges = detailsChanged || Boolean(avatarFile);
  const photo = preview || user.avatar_url;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Your profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Your name and photo are shown to other staff. Your ward decides which farmer reports you see first.
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Photo */}
        <div className="flex flex-col items-center gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
          <div className="relative">
            {photo ? (
              <img src={photo} alt="" className="h-24 w-24 rounded-full border border-slate-200 object-cover" />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-green-700 text-2xl font-semibold text-white">
                {initials(user.name)}
              </span>
            )}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-green-700 text-white hover:bg-green-800"
              aria-label="Choose a new photo"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <p className="text-base font-semibold text-slate-900">Profile photo</p>
            <p className="mt-0.5 text-sm text-slate-500">PNG, JPG or WEBP, up to 5 MB.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button variant="secondary" size="sm" icon={Camera} onClick={() => fileInput.current?.click()}>
                {user.avatar_url ? "Change photo" : "Upload photo"}
              </Button>
              {avatarFile && (
                <Button variant="ghost" size="sm" icon={Trash2} onClick={removeChosenFile}>
                  Cancel
                </Button>
              )}
            </div>
            {avatarFile && <p className="mt-2 text-xs text-green-700">New photo selected. Click Save changes to upload it.</p>}
            {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Name and area */}
        <div className="space-y-4 p-6">
          <ErrorAlert message={formik.status} />
          <Input
            label="Full name"
            autoComplete="name"
            {...formik.getFieldProps("name")}
            error={(formik.touched.name && formik.errors.name) || undefined}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="County"
              placeholder="Choose county"
              options={COUNTY_OPTIONS}
              {...formik.getFieldProps("county")}
              error={(formik.touched.county && formik.errors.county) || undefined}
            />
            <Input
              label="Ward"
              placeholder="e.g. Tinet"
              {...formik.getFieldProps("ward")}
              error={(formik.touched.ward && formik.errors.ward) || undefined}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <Button
            variant="secondary"
            disabled={!hasChanges || formik.isSubmitting}
            onClick={() => {
              formik.resetForm();
              removeChosenFile();
            }}
          >
            Discard
          </Button>
          <Button type="submit" loading={formik.isSubmitting} disabled={!hasChanges}>
            Save changes
          </Button>
        </div>
      </form>

      {/* Account details (read-only) */}
      <section className="rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
        <h3 className="pb-1 pt-3 text-base font-semibold text-slate-900">Account</h3>
        <div className="divide-y divide-slate-100">
          <DetailRow icon={Mail} label="Email">
            {user.email}
          </DetailRow>
          <DetailRow icon={ShieldCheck} label="Role">
            <Badge tone={user.role === "admin" ? "solid" : "gray"}>{capitalize(user.role)}</Badge>
          </DetailRow>
          <DetailRow icon={CalendarDays} label="Joined">
            {formatDate(user.created_at)}
          </DetailRow>
        </div>
        <p className="pb-3 pt-2 text-xs text-slate-400">
          {user.role === "admin"
            ? "As an admin you can change other staff roles on the Users page."
            : "Only an admin can change your role."}
        </p>
      </section>
    </div>
  );
}