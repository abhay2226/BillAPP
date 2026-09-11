import { apiRequest, getCurrentStoreId } from "./api";

/**
 * GET /products?storeId=..
 */
export async function getProducts() {
  const storeId = getCurrentStoreId();

  const result = await apiRequest("/products", {
    params: { storeId },
  });

  return result.data || [];
}

/**
 * POST /products
 *
 * Accepts either { type_id, brand_id } (existing master data)
 * or { typeName, brandName } (create-on-the-fly master data).
 */
export async function createProduct({
  product_name,
  type_id,
  typeName,
  brand_id,
  brandName,
  unit_id,
  unit_quantity,
}) {
  const storeId = getCurrentStoreId();

  const body = {
    store_id: storeId,
    product_name,
    unit_id,
    unit_quantity,
  };

  if (type_id !== undefined && type_id !== null) {
    body.type_id = type_id;
  } else {
    body.typeName = typeName;
  }

  if (brand_id !== undefined && brand_id !== null) {
    body.brand_id = brand_id;
  } else {
    body.brandName = brandName;
  }

  const result = await apiRequest("/products", {
    method: "POST",
    body,
  });

  return result.data;
}

/**
 * PUT /products/:id
 */
export async function updateProduct(productId, payload) {
  const result = await apiRequest(`/products/${productId}`, {
    method: "PUT",
    body: payload,
  });

  return result.data;
}

/**
 * DELETE /products/:id (soft delete / deactivate)
 */
export async function deleteProduct(productId) {
  const result = await apiRequest(`/products/${productId}`, {
    method: "DELETE",
  });

  return result;
}
