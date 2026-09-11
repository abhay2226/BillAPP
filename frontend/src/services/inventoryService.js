import { apiRequest, getCurrentStoreId } from "./api";

/**
 * GET /inventory/store/:storeId
 */
export async function getInventory() {
  const storeId = getCurrentStoreId();

  const result = await apiRequest(`/inventory/store/${storeId}`);

  return result.data || [];
}

/**
 * POST /inventory
 */
export async function createInventory({
  product_id,
  qty,
  cost_price,
  selling_price,
}) {
  const storeId = getCurrentStoreId();

  const result = await apiRequest("/inventory", {
    method: "POST",
    body: {
      product_id,
      store_id: storeId,
      qty,
      cost_price,
      selling_price,
    },
  });

  return result.data;
}

/**
 * PUT /inventory/pricing/:id
 */
export async function updateInventoryPricing(inventoryId, { cost_price, selling_price }) {
  const result = await apiRequest(`/inventory/pricing/${inventoryId}`, {
    method: "PUT",
    body: { cost_price, selling_price },
  });

  return result.data;
}

/**
 * PATCH /inventory/deactivate/:id
 */
export async function deactivateInventory(inventoryId) {
  const result = await apiRequest(`/inventory/deactivate/${inventoryId}`, {
    method: "PATCH",
  });

  return result.data;
}
