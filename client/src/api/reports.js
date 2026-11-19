// farmer reports
import { api } from "./client";

export function getReports(filters = {}) {
  return api.get("/reports", filters);
}

export function getReport(id) {
  return api.get(`/reports/${id}`);
}

// data of farmer_id, category, description 
export function createReport(data) {
  return api.post("/reports", data);
}

// data of status, category
export function updateReport(id, data) {
  return api.patch(`/reports/${id}`, data);
}

// Saves the reply
export function replyToReport(id, message) {
  return api.post(/reports/${id}/reply, { message });
}

// Admin only.
export function deleteReport(id) {
  return api.delete(/reports/${id});
}