import { api, request } from "./client";

// Admin only.
export function getUsers(filters = {}) {
  return api.get("/users", filters);
}


export function changeRole(id, role) {
  return api.patch(/users/${id}/role, { role });
}


export function updateProfile({ name, avatarFile } = {}) {
  if (avatarFile) {
    const form = new FormData();
    if (name) form.append("name", name);
    form.append("avatar", avatarFile);
    return request("/users/me", { method: "PATCH", body: form });
  }
  return api.patch("/users/me", { name });
}