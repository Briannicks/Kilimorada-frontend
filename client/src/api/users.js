// Staff accounts (admin) and the logged-in user's profile.
import { api, request } from "./client";

// Admin only. filters: { status: "pending"|"active", role, search, county, page, per_page }
// → { items: [user], page, per_page, total, pages }
export function getUsers(filters = {}) {
  return api.get("/users", filters);
}

// Admin only. Approves an officer who verified their email. Emails them. → the user
export function approveUser(id) {
  return api.patch(`/users/${id}/approve`);
}

// Admin only. Rejects (deletes) a signup that is still waiting. Emails them.
export function rejectUser(id) {
  return request(`/users/${id}/reject`, { method: "DELETE" });
}

// Admin only. role: "admin" | "officer". You cannot change your own role (400).
export function changeRole(id, role) {
  return api.patch(`/users/${id}/role`, { role });
}

// Update my name, county, ward and/or profile picture.
// avatarFile: a File from <input type="file"> (png, jpg, jpeg or webp, max 5 MB)
export function updateProfile({ name, county, ward, avatarFile } = {}) {
  const fields = { name, county, ward };
  Object.keys(fields).forEach((key) => fields[key] === undefined && delete fields[key]);

  if (avatarFile) {
    const form = new FormData();
    Object.entries(fields).forEach(([key, value]) => form.append(key, value));
    form.append("avatar", avatarFile);
    return request("/users/me", { method: "PATCH", body: form });
  }
  return api.patch("/users/me", fields);
}