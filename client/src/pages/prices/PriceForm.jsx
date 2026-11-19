import { useFormik } from "formik";
import * as Yup from "yup";
import { TrendingUp } from "lucide-react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import ErrorAlert from "../../components/ui/ErrorAlert";
import { createPrice, updatePrice } from "../../api/prices";
import { applyApiErrors } from "../../utils/forms";
import { PRICE_ITEM_OPTIONS, PRICE_SELECT_GROUPS, UNIT_SUGGESTIONS } from "../../constants";

// The backend stores "DAP" as "Dap". This turns it back into the exact menu name.
export function itemName(crop) {
  return PRICE_ITEM_OPTIONS.find((item) => item.toLowerCase() === String(crop).toLowerCase()) || crop;
}

const schema = Yup.object({
  crop: Yup.string().oneOf(PRICE_ITEM_OPTIONS, "Choose an item from the list").required("Choose an item"),
  market: Yup.string().trim().required("Market is required").max(100, "Too long"),
  unit: Yup.string().trim().required("Unit is required, e.g. 50kg bag").max(30, "Too long"),
  price: Yup.number()
    .typeError("Enter the price in KES")
    .integer("Use a whole number, no cents")
    .min(1, "Price must be more than 0")
    .required("Price is required"),
});

// Add or edit a market price. Pass `price` to edit, leave it empty to add.
export default function PriceForm({ open, price, onClose, onSaved }) {
  const editing = Boolean(price);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      crop: price ? itemName(price.crop) : "",
      market: price?.market || "",
      unit: price?.unit || "",
      price: price?.price ?? "",
    },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(null);
      const data = {
        crop: values.crop,
        market: values.market.trim(),
        unit: values.unit.trim(),
        price: Number(values.price),
      };
      try {
        const saved = editing ? await updatePrice(price.id, data) : await createPrice(data);
        helpers.resetForm();
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
      icon={TrendingUp}
      title={editing ? "Edit price" : "Add market price"}
      description="Farmers see the latest prices for each item on USSD."
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form="price-form" loading={formik.isSubmitting}>
            {editing ? "Save changes" : "Add price"}
          </Button>
        </>
      }
    >
      <form id="price-form" onSubmit={formik.handleSubmit} noValidate className="space-y-4">
        <ErrorAlert message={formik.status} />
        <Select
          label="Item"
          required
          placeholder="Choose an item"
          groups={PRICE_SELECT_GROUPS}
          {...formik.getFieldProps("crop")}
          error={fieldError("crop")}
        />
        <Input
          label="Market"
          required
          placeholder="e.g. Nakuru"
          {...formik.getFieldProps("market")}
          error={fieldError("market")}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Unit"
              required
              list="price-units"
              placeholder="e.g. 50kg bag"
              {...formik.getFieldProps("unit")}
              error={fieldError("unit")}
            />
            <datalist id="price-units">
              {UNIT_SUGGESTIONS.map((unit) => (
                <option key={unit} value={unit} />
              ))}
            </datalist>
          </div>
          <Input
            label="Price (KES)"
            required
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            {...formik.getFieldProps("price")}
            error={fieldError("price")}
          />
        </div>
      </form>
    </Modal>
  );
}