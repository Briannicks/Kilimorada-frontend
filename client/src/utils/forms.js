// Puts API errors onto a Formik form.
// 422 field errors go under the matching input; the main message goes to formik.status.
export function applyApiErrors(error, formik) {
  const fieldErrors = Object.fromEntries(
    Object.entries(error?.fieldErrors || {}).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages[0] : String(messages),
    ])
  );
  if (Object.keys(fieldErrors).length) formik.setErrors(fieldErrors);
  formik.setStatus(error?.message || "Something went wrong.");
}

// Kenyan phone check used by farmer and agrovet forms (0712345678, +254712345678, 254...)
export const KENYAN_PHONE = /^(?:\+?254|0)[17]\d{8}$/;

export function cleanPhone(value = "") {
  return value.replace(/[\s-]/g, "");
}