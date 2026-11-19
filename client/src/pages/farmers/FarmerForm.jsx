import { useFormik } from "formik";
import * as Yup from "yup";
import { UserPlus } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { createFarmer, updateFarmer } from "../../api/farmers";
import { applyApiErrors, cleanPhone, KENYAN_PHONE } from "../../utils/forms";
import { CROP_SUGGESTIONS } from "../../constants";

const schema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").max(100, "Too long").required("Full name is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .test("kenyan-phone", "Use a Kenyan number like 0712345678", (value) => KENYAN_PHONE.test(cleanPhone(value))),
  ward: Yup.string().trim().max(100, "Too long"),
  main_crop: Yup.string().trim().max(50, "Too long"),
});

// Add or edit a farmer. Pass `farmer` to edit, leave it empty to add.
export default function FarmerForm({ open, farmer, onClose, onSaved }) {
  const editing = Boolean(farmer);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: farmer?.name || "",
      phone: farmer?.phone || "",
      ward: farmer?.ward || "",
      main_crop: farmer?.main_crop || "",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      const data = {
        name: values.name.trim(),
        phone: cleanPhone(values.phone),
        ward: values.ward.trim() || null,
        main_crop: values.main_crop.trim() || null,
      };
      try {
        const saved = editing ? await updateFarmer(farmer.id, data) : await createFarmer(data);
        helpers.resetForm();
        onSaved(saved, editing);
      } catch (error) {
        applyApiErrors(error, helpers);
        // 409 = this phone number already belongs to another farmer
        if (error.status === 409) helpers.setFieldError("phone", error.message);
      }
    },
  });

  const handleClose = () => {
    if (formik.isSubmitting) return;
    formik.resetForm();
    onClose();
  };

  const fieldError = (name) => (formik.touched[name] && formik.errors[name]) || undefined;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      icon={UserPlus}
      title={editing ? "Edit farmer" : "Add farmer"}
      description={
        editing
          ? "Changes apply to SMS alerts and the farmer's USSD menu."
          : "For farmers registered in person. Farmers can also register themselves on USSD."
      }
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="farmer-form" loading={formik.isSubmitting}>
            {editing ? "Save changes" : "Add farmer"}
          </Button>
        </>
      }
    >
      <form id="farmer-form" onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <ErrorAlert message={formik.status} />
        <Input label="Full name" required {...formik.getFieldProps("name")} error={fieldError("name")} />
        <Input
          label="Phone number"
          required
          type="tel"
          inputMode="tel"
          placeholder="0712345678"
          hint="The number the farmer uses for USSD and SMS."
          {...formik.getFieldProps("phone")}
          error={fieldError("phone")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Ward" {...formik.getFieldProps("ward")} error={fieldError("ward")} />
          <div>
            <Input
              label="Main crop"
              list="farmer-crops"
              placeholder="e.g. Maize"
              {...formik.getFieldProps("main_crop")}
              error={fieldError("main_crop")}
            />
            <datalist id="farmer-crops">
              {CROP_SUGGESTIONS.map((crop) => (
                <option key={crop} value={crop} />
              ))}
            </datalist>
          </div>
        </div>
      </form>
    </Modal>
  );
}