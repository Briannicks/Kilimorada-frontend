// Numbers for the Dashboard page.
import { api } from "./client";

//   sms_sent, reports_by_category
export function getDashboard() {
  return api.get("/dashboard");
}

//   verified_agrovets, most_reported
export function getUssdStats() {
  return api.get("/ussd-stats");
}