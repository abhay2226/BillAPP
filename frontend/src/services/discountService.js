// import { apiRequest, getCurrentStoreId } from "./api";

// // ======================================================
// // GET ALL ACTIVE DISCOUNT TYPES
// // GET /discounts/types
// // ======================================================
// export async function getDiscountTypes() {
//   const result = await apiRequest("/discounts/types");
//   return result.data || [];
// }

// // ======================================================
// // GET DISCOUNT TYPE BY CODE
// // GET /discounts/types/by-code?name=PERCENT
// // ======================================================
// export async function getDiscountTypeByCode(code) {
//   if (!code) {
//     return null;
//   }

//   const result = await apiRequest(
//     `/discounts/types/by-code?name=${encodeURIComponent(code)}`
//   );

//   return result.data || null;
// }

// // ======================================================
// // GET DISCOUNT TYPE BY ID
// // GET /discounts/types/:id
// // ======================================================
// export async function getDiscountTypeById(id) {
//   const result = await apiRequest(`/discounts/types/${id}`);
//   return result.data || null;
// }

// // ======================================================
// // GET ACTIVE DISCOUNTS FOR CURRENT STORE
// // GET /discounts/store/:storeId
// // ======================================================
// export async function getActiveDiscounts() {
//   const storeId = getCurrentStoreId();

//   if (!storeId) {
//     return [];
//   }

//   const result = await apiRequest(`/discounts/store/${storeId}`);
//   return result.data || [];
// }

// // ======================================================
// // GET DISCOUNT BY ID
// // GET /discounts/:id
// // ======================================================
// export async function getDiscountById(id) {
//   const result = await apiRequest(`/discounts/${id}`);
//   return result.data || null;
// }

// // ======================================================
// // GET DISCOUNT BY NAME
// // GET /discounts/by-name?storeId=1&name=Summer
// // ======================================================
// export async function getDiscountByName(name) {
//   const storeId = getCurrentStoreId();

//   if (!storeId || !name) {
//     return null;
//   }

//   const result = await apiRequest(
//     `/discounts/by-name?storeId=${storeId}&name=${encodeURIComponent(name)}`
//   );

//   return result.data || null;
// }

// // ======================================================
// // CREATE DISCOUNT
// // POST /discounts/
// // OWNER ONLY
// // ======================================================
// export async function createDiscount(discountData) {
//   const result = await apiRequest("/discounts", {
//     method: "POST",
//     body: JSON.stringify(discountData),
//   });

//   return result.data;
// }

// // ======================================================
// // UPDATE DISCOUNT
// // PATCH /discounts/:id
// // OWNER ONLY
// // ======================================================
// export async function updateDiscount(id, discountData) {
//   const result = await apiRequest(`/discounts/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(discountData),
//   });

//   return result.data;
// }

// // ======================================================
// // ACTIVATE / DEACTIVATE DISCOUNT
// // PATCH /discounts/:id/status
// // OWNER ONLY
// // ======================================================
// export async function setDiscountActive(id, isActive) {
//   const result = await apiRequest(`/discounts/${id}/status`, {
//     method: "PATCH",
//     body: JSON.stringify({
//       is_active: isActive,
//     }),
//   });

//   return result.data;
// }
import {
  apiRequest,
  getCurrentStoreId,
} from "./api";

// ============================================================
// DISCOUNT TYPES
// ============================================================

export async function getDiscountTypes() {
  const result = await apiRequest(
    "/discounts/types"
  );

  return result.data || [];
}

export async function getDiscountTypeByCode(code) {
  if (!code) {
    return null;
  }

  const result = await apiRequest(
    `/discounts/types/by-code?name=${encodeURIComponent(code)}`
  );

  return result.data || null;
}

export async function getDiscountTypeById(id) {
  if (!id) {
    return null;
  }

  const result = await apiRequest(
    `/discounts/types/${id}`
  );

  return result.data || null;
}


// ============================================================
// GET ACTIVE DISCOUNTS FOR CURRENT STORE
// Used by BOTH Discounts.jsx and Billing.jsx
// ============================================================

export async function getActiveDiscounts() {
  const storeId = getCurrentStoreId();

  if (!storeId) {
    return [];
  }

  const result = await apiRequest(
    `/discounts/store/${storeId}`
  );

  return result.data || [];
}


// ============================================================
// GET ONE DISCOUNT
// ============================================================

export async function getDiscountById(id) {
  if (!id) {
    return null;
  }

  const result = await apiRequest(
    `/discounts/${id}`
  );

  return result.data || null;
}


// ============================================================
// GET DISCOUNT BY NAME
// ============================================================

export async function getDiscountByName(name) {
  const storeId = getCurrentStoreId();

  if (!storeId || !name) {
    return null;
  }

  const result = await apiRequest(
    `/discounts/by-name?storeId=${storeId}&name=${encodeURIComponent(name)}`
  );

  return result.data || null;
}

// ============================================================
// CREATE DISCOUNT
// ============================================================

export async function createDiscount(discountData) {
  const result = await apiRequest("/discounts", {
    method: "POST",
    body: discountData,
  });

  return result.data;
}


// ============================================================
// UPDATE DISCOUNT
// ============================================================

export async function updateDiscount(id, discountData) {
  const result = await apiRequest(`/discounts/${id}`, {
    method: "PATCH",
    body: discountData,
  });

  return result.data;
}


// ============================================================
// ACTIVATE / DEACTIVATE
// ============================================================

export async function setDiscountActive(id, isActive) {
  const result = await apiRequest(`/discounts/${id}/status`, {
    method: "PATCH",
    body: {
      is_active: isActive,
    },
  });

  return result.data;
}




// ============================================================
// GET ALL DISCOUNTS FOR CURRENT STORE
// Used by Discounts.jsx
// ============================================================

export async function getAllDiscounts() {
  const storeId = getCurrentStoreId();

  if (!storeId) {
    return [];
  }

  const result = await apiRequest(
    `/discounts/store/${storeId}/all`
  );

  return result.data || [];
}