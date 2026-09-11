import { apiRequest } from "./api";

/**
 * GET /customers/phone?phone=..
 * Returns null instead of throwing when no customer matches.
 */
export async function findCustomerByPhone(phone) {
  try {
    const result = await apiRequest("/customers/phone", {
      params: { phone },
    });

    return result.data || null;
  } catch {
    return null;
  }
}

/**
 * POST /customers
 */
export async function createCustomer(phone) {
  const result = await apiRequest("/customers", {
    method: "POST",
    body: { phone_no: phone },
  });

  return result.data;
}

/**
 * Finds a customer by phone number, creating one if it doesn't exist yet.
 */
export async function findOrCreateCustomer(phone) {
  const existing = await findCustomerByPhone(phone);

  if (existing) {
    return existing;
  }

  return createCustomer(phone);
}
