import { apiRequest, getCurrentStoreId } from "./api";

/**
 * POST /bills
 *
 * items: [{ inventory_id, qty }]
 */
export async function createBill({ customer_id, items, discount_id, tax_total }) {
  const storeId = getCurrentStoreId();

  const result = await apiRequest("/bills", {
    method: "POST",
    body: {
      store_id: storeId,
      customer_id,
      items,
      discount_id: discount_id ?? null,
      tax_total: tax_total ?? 0,
    },
  });

  return result.data;
}

/**
 * GET /bills/history/:storeId
 */
export async function getBillHistory(filters = {}) {
  const storeId = getCurrentStoreId();

  const result = await apiRequest(`/bills/history/${storeId}`, {
    params: filters,
  });

  return result.data || [];
}

/**
 * GET /bills/items/:id
 */
export async function getBillItems(billId) {
  const result = await apiRequest(`/bills/items/${billId}`);
  return result.data || [];
}

/**
 * GET /bills/:storeId/:id
 */
export async function getBillById(billId) {
  const storeId = getCurrentStoreId();

  const result = await apiRequest(`/bills/${storeId}/${billId}`);
  return result.data;
}

/**
 * DELETE /bills/:id
 */
export async function cancelBill(billId) {
  const result = await apiRequest(`/bills/${billId}`, {
    method: "DELETE",
  });

  return result.data;
}
