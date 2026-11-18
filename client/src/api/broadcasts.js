// SMS broadcasts to farmers.
import { api } from "./client";

export function getBroadcasts(filters = {}) {
  return api.get("/broadcasts", filters);
}

// message: max characters is 160. targetCrop: e.g. "Maize", or empty for all farmers.
// broadcast and sms: { sent, failed }   (400 if no farmers match)
export function sendBroadcast({ message, targetCrop }) {
  return api.post("/broadcasts", {
    message,
    target_crop: targetCrop || null,
  });
}
