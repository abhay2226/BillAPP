import { apiRequest, getCurrentStoreId } from "./api";

/**
 * GET /discounts/store/:storeId
 */
export async function getActiveDiscounts() {
  const storeId = getCurrentStoreId();

  if (!storeId) {
    return [];
  }

  const result = await apiRequest(`/discounts/store/${storeId}`);
  return result.data || [];
}
