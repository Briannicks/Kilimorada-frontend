// Sign up, two-step login, current user and logout.
import { request } from "./client";

// 201 → the new user (already logged in). The first account ever becomes admin.
export function signup({ name, email, password }) {
  return request("/signup", {
    method: "POST",
    body: { name, email, password },
    handleUnauthorized: false,
  });
}

// Returns either the user (2FA off) or
// { two_factor_required: true, message: "We sent a 6-digit code to ..." }
export function login({ email, password }) {
  return request("/login", {
    method: "POST",
    body: { email, password },
    handleUnauthorized: false,
  });
}

// Second login step. Returns the user. 401 = wrong code, 429 = too many attempts.
export function verifyCode(code) {
  return request("/verify-otp", {
    method: "POST",
    body: { code: String(code).trim() },
    handleUnauthorized: false,
  });
}

// Returns { message }
export function resendCode() {
  return request("/resend-otp", { method: "POST", handleUnauthorized: false });
}

// Returns the logged-in user, or null if nobody is logged in.
export async function getMe() {
  try {
    return await request("/me", { handleUnauthorized: false });
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export function logout() {
  return request("/logout", { method: "DELETE", handleUnauthorized: false });
}
