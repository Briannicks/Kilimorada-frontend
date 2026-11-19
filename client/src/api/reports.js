// farmer reports
import { api } from "./client";

export function getReports(filters = {}) {
  return api.get("/reports", filters);
}

export function getReport(id) {
  return api.get(`/reports/${id}`);
}

