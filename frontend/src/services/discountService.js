
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

  return Array.isArray(result.data) ? result.data : [];
}

/**
 * GET /discounts/store/:storeId/all
 */
export async function getAllDiscounts() {
  const storeId = getCurrentStoreId();

  if (!storeId) {
    return [];
  }

  const result = await apiRequest(`/discounts/store/${storeId}/all`);

  return Array.isArray(result.data) ? result.data : [];
}

/**
 * GET /discounts/types
 */
export async function getDiscountTypes() {
  const result = await apiRequest("/discounts/types");

  return Array.isArray(result.data) ? result.data : [];
}

/**
 * POST /discounts
 */
export async function createDiscount({
  discount_name,
  discount_type_id,
  discount_value,
  min_bill_amount,
  max_discount_amount,
  discount_from,
  discount_to,
  description,
}) {
  const result = await apiRequest("/discounts", {
    method: "POST",

    body: {
      discount_name,
      discount_type_id,
      discount_value,
      min_bill_amount,
      max_discount_amount,
      discount_from,
      discount_to: discount_to || null,
      description: description || "",
    },
  });

  return result.data;
}

/**
 * PUT /discounts/:discountId
 */
export async function updateDiscount(discountId, {
  discount_name,
  discount_type_id,
  discount_value,
  min_bill_amount,
  max_discount_amount,
  discount_from,
  discount_to,
  description,
}) {
  const result = await apiRequest(`/discounts/${discountId}`, {
    method: "PUT",

    body: {
      discount_name,
      discount_type_id,
      discount_value,
      min_bill_amount,
      max_discount_amount,
      discount_from,
      discount_to: discount_to || null,
      description: description || "",
    },
  });

  return result.data;
}

/**
 * DELETE /discounts/:discountId
 */
export async function deleteDiscount(discountId) {
  const result = await apiRequest(`/discounts/${discountId}`, {
    method: "DELETE",
  });

  return result;
}

/**
 * DEACTIVATE DISCOUNT
 *
 * Uses DELETE /discounts/:discountId
 */
export async function deactivateDiscount(discountId) {
  const result = await apiRequest(`/discounts/${discountId}`, {
    method: "DELETE",
  });

  return result;
}