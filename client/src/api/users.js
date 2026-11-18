import { api, request } from "./client";

// Admin only.
export function getUsers(filters = {}) {
  return api.get("/users", filters);
}


export function changeRole(id, role) {
  return api.patch(/users/${id}/role, { role });
}

