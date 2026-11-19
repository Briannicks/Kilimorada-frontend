// Features: verified agrovets, batch code registry and USSD activity.
import { api } from "./client";

//Agrovets (USSD option 7)
export function getAgrovets(filters = {}) {
  return api.get("/agrovets", filters);
}

//Admin only data: { name, ward, phone, license_no }
export function createAgrovet(data) {
  return api.post("/agrovets", data);
}

export function updateAgrovet(id, data) {
  return api.patch(`/agrovets/${id}`, data);
}

export function deleteAgrovet(id) {
  return api.delete(`/agrovets/${id}`);
}

//Batch codes (USSD option 9)
export function getBatchCodes(filters = {}) {
  return api.get("/batch-codes", filters);
}

//Admin only. data: { batch_code, product, manufacturer, status: "genuine"|"fake" }
export function createBatchCode(data) {
  return api.post("/batch-codes", data);
}

export function updateBatchCode(id, data) {
  return api.patch(`/batch-codes/${id}`, data);
}

export function deleteBatchCode(id) {
  return api.delete(`/batch-codes/${id}`);
}

//USSD activity
//filters: { kind: "batch_code"|"scam_number", page, per_page }
export function getInputReports(filters = {}) {
  return api.get("/input-reports", filters);
}

export function getAiQuestions(filters = {}) {
  return api.get("/ai-questions", filters);
}
