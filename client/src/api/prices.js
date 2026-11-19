import { api } from "./client";

// filters
export function getPrices(filters = {}) {
  return api.get("/prices", filters);
}

// data
export function createPrice(data) {
  return api.post("/prices", data);
}

// Only the person who posted it, or an admin (403 otherwise).
export function updatePrice(id, data) {
  return api.patch(`/prices/${id}`, data);
}

export function deletePrice(id) {
  return api.delete(`/prices/${id}`);
}

