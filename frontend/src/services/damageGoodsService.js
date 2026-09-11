import { apiRequest } from "./api";

/**
 * GET /damaged-goods (store-scoped server side, via auth token)
 */
export async function getDamagedGoods() {
  const result = await apiRequest("/damaged-goods");
  return result.data || [];
}

/**
 * POST /damaged-goods
 */
export async function createDamagedGoods({ inventory_id, qty, reason, unit_cost }) {
  const result = await apiRequest("/damaged-goods", {
    method: "POST",
    body: { inventory_id, qty, reason, unit_cost },
  });

  return result.data;
}

/**
 * PUT /damaged-goods/:id
 */
export async function updateDamagedGoods(damageId, { qty, reason, unit_cost }) {
  const result = await apiRequest(`/damaged-goods/${damageId}`, {
    method: "PUT",
    body: { qty, reason, unit_cost },
  });

  return result.data;
}

/**
 * PATCH /damaged-goods/deactivate/:id
 */
export async function deactivateDamagedGoods(damageId) {
  const result = await apiRequest(`/damaged-goods/deactivate/${damageId}`, {
    method: "PATCH",
  });

  return result.data;
}
