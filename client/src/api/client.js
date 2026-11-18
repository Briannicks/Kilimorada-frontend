const BASE_URL = "/api";

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// AuthContext registers a function here so a 401 anywhere logs the user out.
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Builds "?page=2&ward=Tinet", skipping empty values.
function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

async function readBody(response) {
  if (response.status === 204) return null;
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) return response.json();
  const text = await response.text();
  return text || null;
}


export async function request(path, { method = "GET", body, params, handleUnauthorized = true } = {}) {
  const options = {
    method,
    credentials: "include",
    headers: { Accept: "application/json" },
  };

  if (body instanceof FormData) {
    options.body = body; 
  } else if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}${buildQuery(params)}`, options);
  } catch {
    throw new ApiError("Can't reach the server. Check your internet connection and try again.", 0);
  }

  const data = await readBody(response);

  if (response.ok) return data;

  if (response.status === 401 && handleUnauthorized && onUnauthorized) {
    onUnauthorized();
  }

  if (data && typeof data === "object") {
    throw new ApiError(data.error || "Something went wrong.", response.status, data.errors || {});
  }
  if (response.status >= 500) {
    throw new ApiError("The server is having a problem. Please try again in a moment.", response.status);
  }
  throw new ApiError("Something went wrong. Please try again.", response.status);
}

// Shortcuts used by the other api files
export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};