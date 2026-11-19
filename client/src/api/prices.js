import { api } from "./client";

// filters
export function getPrices(filters = {}) {
  return api.get("/prices", filters);
}

// data
export function createPrice(data) {
  return api.post("/prices", data);
}