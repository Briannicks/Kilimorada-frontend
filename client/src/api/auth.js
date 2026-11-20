// Sign up, email verification, two-step login, current user and logout.
import { request } from "./client";

// 201 → { verification_required: true, message }. A code is emailed; the user is NOT logged in yet.
// The first account ever becomes the admin.
export function signup({ name, email, password, county, ward }) {
  return request("/signup", {
    method: "POST",
    body: { name, email, password, county, ward },
    handleUnauthorized: false,
  });
}

// Returns one of:
//   { two_factor_required: true, message }   → go to /verify (login code)
//   { verification_required: true, message } → go to /verify (email not verified yet)
//   the user                                 → logged in (2FA off)
// Throws 403 when an admin hasn't approved the account yet.
export function login({ email, password }) {
  return request("/login", {
    method: "POST",
    body: { email, password },
    handleUnauthorized: false,
  });
}

// Checks the emailed code. Returns either the user (logged in)
// or { pending_approval: true, message } after verifying a new signup.
// 401 = wrong code, 429 = too many attempts.
export function verifyCode(code) {
  return request("/verify-otp", {
    method: "POST",
    body: { code: String(code).trim() },
    handleUnauthorized: false,
  });
}

// Returns { message }. 429 = asked again too soon.
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