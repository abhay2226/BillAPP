const API_URL = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token");
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Returns the store ID of the currently logged in user.
 */
export function getCurrentStoreId() {
  const user = getStoredUser();
  return user?.storeId ?? null;
}

/**
 * Returns the currently logged in user object (as saved by AuthContext).
 */
export function getCurrentUser() {
  return getStoredUser();
}

/**
 * Generic authenticated request helper used by every service module.
**/
export async function apiRequest(path, { method = "GET", body, params } = {}) {
  let url = `${API_URL}${path}`;

  if (params) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    const queryString = query.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const token = getToken();

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let result = null;

  try {
    result = await response.json();
  } catch {
    result = null;
  }

  if (!response.ok || (result && result.success === false)) {
    const message =
      (result && (result.message || result.error)) ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return result || {};
}

export { API_URL };
