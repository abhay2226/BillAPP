import { API_URL } from "./api";
/**
 * LOGIN
 *
 * POST /auth/login
 */
export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Login failed.");
  }

  return result.data;
}


/**
 * SIGNUP
 *
 * CREATE NEW STORE:
 *
 * {
 *   firstname,
 *   lastname,
 *   email,
 *   password,
 *   store_name,
 *   gst_no,
 *   location
 * }
 *
 * JOIN EXISTING STORE:
 *
 * {
 *   firstname,
 *   lastname,
 *   email,
 *   password,
 *   store_id
 * }
 */
export async function signup({
  firstname,
  lastname,
  email,
  password,
  store_name,
  gst_no,
  location,
  store_id,
  role_id,
}) {
  const body = {
    firstname,
    lastname,
    email,
    password,
  };

  if (store_id !== undefined && store_id !== null && store_id !== "") {
    body.store_id = Number(store_id);

    if (role_id !== undefined && role_id !== null && role_id !== "") {
      body.role_id = Number(role_id);
    }
  } else {
    body.store_name = store_name;
    body.gst_no = gst_no;
    body.location = location;
  }

  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Signup failed.");
  }

  return result.data;
}


/**
 * GET SIGNUP ROLES
 *
 * GET /auth/signup-roles
 *
 * No authentication required.
 */
export async function getSignupRoles() {
  const response = await fetch(`${API_URL}/auth/signup-roles`);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to load signup roles."
    );
  }

  return result.data;
}


/**
 * GET SIGNUP STORES
 *
 * GET /auth/signup-stores
 * GET /auth/signup-stores?search=...
 *
 * No authentication required.
 *
 * Returns:
 *
 * [
 *   {
 *     storeId,
 *     storeName,
 *     location,
 *     ownerUserId,
 *     ownerName
 *   }
 * ]
 */
export async function getSignupStores(search = "") {
  const trimmedSearch = search.trim();

  const url = trimmedSearch
    ? `${API_URL}/auth/signup-stores?search=${encodeURIComponent(
        trimmedSearch
      )}`
    : `${API_URL}/auth/signup-stores`;

  const response = await fetch(url);

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to load stores."
    );
  }

  return result.data;
}


/**
 * LOGOUT
 *
 * POST /auth/logout
 *
 * Backend requires:
 * Authorization: Bearer <token>
 */
export async function logout() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Logout failed.");
  }

  return true;
}

