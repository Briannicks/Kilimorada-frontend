import { useFormik } from "formik";
import * as Yup from "yup";
import { Store } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { createAgrovet, updateAgrovet } from "../../api/registry";
import { applyApiErrors, cleanPhone, KENYAN_PHONE } from "../../utils/forms";

const schema = Yup.object({
  name: Yup.string().trim().required("Shop name is required").max(100, "Too long"),
  ward: Yup.string().trim().required("Ward is required").max(100, "Too long"),
  phone: Yup.string()
    .required("Phone number is required")
    .test("kenyan-phone", "Use a Kenyan number like 0712345678", (value) => KENYAN_PHONE.test(cleanPhone(value))),
  license_no: Yup.string().trim().max(50, "Too long"),
});

// Add or edit a verified agrovet. Pass `agrovet` to edit, leave it empty to add.
export default function AgrovetForm({ open, agrovet, onClose, onSaved }) {
  const editing = Boolean(agrovet);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: agrovet?.name || "",
      ward: agrovet?.ward || "",
      phone: agrovet?.phone || "",
      license_no: agrovet?.license_no || "",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      const data = {
        name: values.name.trim(),
        ward: values.ward.trim(),
        phone: cleanPhone(values.phone),
        license_no: values.license_no.trim() || null,
      };
      try {
        const saved = editing ? await updateAgrovet(agrovet.id, data) : await createAgrovet(data);
        onSaved(saved, editing);
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

  const fieldError = (name) => (formik.touched[name] && formik.errors[name]) || undefined;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      icon={Store}
      title={editing ? "Edit agrovet" : "Add agrovet"}
      description="Verified shops are listed for farmers on USSD option 7."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="agrovet-form" loading={formik.isSubmitting}>
            {editing ? "Save changes" : "Add agrovet"}
          </Button>
        </>
      }
    >
      <form id="agrovet-form" onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <ErrorAlert message={formik.status} />
        <Input label="Shop name" required {...formik.getFieldProps("name")} error={fieldError("name")} />
        <Input label="Ward" required {...formik.getFieldProps("ward")} error={fieldError("ward")} />
        <Input
          label="Phone number"
          required
          type="tel"
          inputMode="tel"
          placeholder="0712345678"
          {...formik.getFieldProps("phone")}
          error={fieldError("phone")}
        />
        <Input
          label="Licence number"
          hint="PCPB or county licence, if the shop has one."
          {...formik.getFieldProps("license_no")}
          error={fieldError("license_no")}
        />
      </form>
    </Modal>
  );
}