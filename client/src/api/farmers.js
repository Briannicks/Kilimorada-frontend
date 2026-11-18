// Farmers registered through USSD or added by officers.
import { api } from "./client";

// filters: { search, ward, crop, page, per_page }
// → { items: [farmer], page, per_page, total, pages }
export function getFarmers(filters = {}) {
  return api.get("/farmers", filters);
}

// → farmer + reports: [report]
export function getFarmer(id) {
  return api.get(`/farmers/${id}`);
}

// data: { name, phone, ward, main_crop }  (409 if the phone is already registered)
export function createFarmer(data) {
  return api.post("/farmers", data);
}

// data: any of { name, phone, ward, main_crop }
export function updateFarmer(id, data) {
  return api.patch(`/farmers/${id}`, data);
}

// Admin only. Also deletes the farmer's reports.
export function deleteFarmer(id) {
  return api.delete(`/farmers/${id}`);
}
