import { apiRequest } from "./api";

/**
 * GET /product-types
 */
export async function getProductTypes() {
  const result = await apiRequest("/product-types");
  return result.data || [];
}

/**
 * GET /product-brands
 */
export async function getProductBrands() {
  const result = await apiRequest("/product-brands");
  return result.data || [];
}

/**
 * GET /units
 */
export async function getUnits() {
  const result = await apiRequest("/units");
  return result.data || [];
}

export async function deleteProductType(productTypeId) {
  return apiRequest(`/product-types/${productTypeId}`, {
    method: "DELETE",
  });
}

export async function deleteProductBrand(productBrandId) {
  return apiRequest(`/product-brands/${productBrandId}`, {
    method: "DELETE",
  });
}
