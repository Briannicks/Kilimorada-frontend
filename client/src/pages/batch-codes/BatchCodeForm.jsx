import { useFormik } from "formik";
import * as Yup from "yup";
import { Barcode } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { createBatchCode, updateBatchCode } from "../../api/registry";
import { applyApiErrors } from "../../utils/forms";
import { BATCH_STATUS_OPTIONS } from "../../constants";

const schema = Yup.object({
  batch_code: Yup.string()
    .trim()
    .required("Batch code is required")
    .test("length", "Batch code must be at least 3 characters", (value) => (value || "").replace(/\s/g, "").length >= 3)
    .max(50, "Too long"),
  product: Yup.string().trim().required("Product is required").max(100, "Too long"),
  manufacturer: Yup.string().trim().required("Manufacturer is required").max(100, "Too long"),
  status: Yup.string().oneOf(["genuine", "fake"]).required("Choose a status"),
});

// Add or edit a batch code from official records. Pass `batchCode` to edit.
export default function BatchCodeForm({ open, batchCode, onClose, onSaved }) {
  const editing = Boolean(batchCode);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      batch_code: batchCode?.batch_code || "",
      product: batchCode?.product || "",
      manufacturer: batchCode?.manufacturer || "",
      status: batchCode?.status || "genuine",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      const data = {
        batch_code: values.batch_code.replace(/\s/g, "").toUpperCase(),
        product: values.product.trim(),
        manufacturer: values.manufacturer.trim(),
        status: values.status,
      };
      try {
        const saved = editing ? await updateBatchCode(batchCode.id, data) : await createBatchCode(data);
        onSaved(saved, editing);
      } catch (error) {
        applyApiErrors(error, helpers);
        // 409 = this batch code is already registered
        if (error.status === 409) helpers.setFieldError("batch_code", "This batch code is already registered");
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
      icon={Barcode}
      title={editing ? "Edit batch code" : "Add batch code"}
      description="Farmers check these codes on USSD option 9 before buying inputs."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="batch-code-form" loading={formik.isSubmitting}>
            {editing ? "Save changes" : "Add batch code"}
          </Button>
        </>
      }
    >
      <form id="batch-code-form" onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <ErrorAlert message={formik.status} />
        <Input
          label="Batch code"
          required
          hint="Exactly as printed on the bag or packet. Spaces are removed."
          {...formik.getFieldProps("batch_code")}
          inputClassName="uppercase"
          error={fieldError("batch_code")}
        />
        <Input
          label="Product"
          required
          placeholder="e.g. DAP 50kg"
          {...formik.getFieldProps("product")}
          error={fieldError("product")}
        />
        <Input
          label="Manufacturer"
          required
          {...formik.getFieldProps("manufacturer")}
          error={fieldError("manufacturer")}
        />
        <Select
          label="Status"
          required
          options={BATCH_STATUS_OPTIONS}
          hint="Mark as Fake when a regulator or manufacturer confirms a counterfeit batch."
          {...formik.getFieldProps("status")}
          error={fieldError("status")}
        />
      </form>
    </Modal>
  );
}