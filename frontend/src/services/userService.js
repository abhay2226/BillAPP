import { apiRequest } from "./api";

/**
 * PUT /users/:userId
 *
 * payload may include: firstname, lastname, email, role_id, is_active
 */
export async function updateUser(userId, payload) {
  const result = await apiRequest(`/users/${userId}`, {
    method: "PUT",
    body: payload,
  });

  return result.data;
}

/**
 * GET /users/:userId
 */
export async function getUserById(userId) {
  const result = await apiRequest(`/users/${userId}`);
  return result.data;
}
