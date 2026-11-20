// Fixed lists used by forms. These are option lists, not data.

// Market price items. The names must match exactly what the USSD menu looks for.
export const PRICE_ITEM_GROUPS = [
  { label: "Fertilizer", items: ["DAP", "CAN", "NPK"] },
  { label: "Seeds", items: ["Maize Seed", "Bean Seed", "Tomato Seed"] },
  { label: "Fuel", items: ["Petrol", "Diesel", "Kerosene"] },
  { label: "Produce", items: ["Maize", "Tomatoes", "Potatoes"] },
];

// Same list in the shape <Select groups={...}> expects
export const PRICE_SELECT_GROUPS = PRICE_ITEM_GROUPS.map((group) => ({
  label: group.label,
  options: group.items.map((item) => ({ value: item, label: item })),
}));

export const PRICE_ITEM_OPTIONS = PRICE_ITEM_GROUPS.flatMap((group) => group.items);

export function priceCategory(item) {
  const group = PRICE_ITEM_GROUPS.find((g) => g.items.some((i) => i.toLowerCase() === String(item).toLowerCase()));
  return group ? group.label : "Other";
}

export const UNIT_SUGGESTIONS = ["50kg bag", "90kg bag", "25kg bag", "2kg pack", "kg", "litre", "crate"];

export const CROP_SUGGESTIONS = ["Maize", "Beans", "Potatoes", "Tomatoes", "Tea", "Coffee", "Avocado", "Wheat", "Sorghum", "Kale"];

export const REPORT_CATEGORIES = [
  { value: "pest", label: "Pest" },
  { value: "disease", label: "Disease" },
  { value: "weather", label: "Weather" },
  { value: "other", label: "Other" },
];

export const REPORT_STATUSES = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

export const ROLE_OPTIONS = [
  { value: "officer", label: "Officer" },
  { value: "admin", label: "Admin" },
];

export const BATCH_STATUS_OPTIONS = [
  { value: "genuine", label: "Genuine" },
  { value: "fake", label: "Fake" },
];

export const PER_PAGE = 10;
export const SMS_LIMIT = 160;
export const REPLY_LIMIT = 450;

// Kenya's 47 counties. Must match server/kenya.py exactly.
export const KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos",
  "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
  "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu",
  "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Turkana",
  "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

export const COUNTY_OPTIONS = KENYA_COUNTIES.map((county) => ({ value: county, label: county }));