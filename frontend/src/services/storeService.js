import { apiRequest, getCurrentStoreId } from "./api";

/**
 * GET /stores/:id
 */
export async function getCurrentStore() {
  const storeId = getCurrentStoreId();

  if (!storeId) {
    return null;
  }

  const result = await apiRequest(`/stores/${storeId}`);
  return result.data;
}

/**
 * PUT /stores/:id  (OWNER only)
 *
 * payload may include: store_name, gst_no, location
 */
export async function updateCurrentStore(payload) {
  const storeId = getCurrentStoreId();

  const result = await apiRequest(`/stores/${storeId}`, {
    method: "PUT",
    body: payload,
  });

  return result.data;
}
