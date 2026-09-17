import { AppDataSource } from "../datasource.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { DiscountType } from "../entity/MasterDiscountType.js";
import { Store } from "../entity/TransactionsStore.js";
import { getDiscountTypeById } from "./DiscountTypeServices.js";
import { isUniqueConstraintError } from "./Errors.js";


const discountRepo = AppDataSource.getRepository(Discount);
const discountTypeRepo = AppDataSource.getRepository(DiscountType);
const storeRepo = AppDataSource.getRepository(Store);

export interface DiscountInput {
  discount_name: string;
  discount_value: number;
  min_bill_amount: number;
  max_discount_amount: number;
  discount_from: Date;
  discount_to?: Date | null;
  description: string;
  store_id: number;
  discount_type_id: number;
}

// ======================================================
// CREATE DISCOUNT
// ======================================================
export const createDiscountService = async (data: DiscountInput, userId: number) => {
  const discountName = data.discount_name?.trim();
  if (!discountName) {
    throw new Error("Discount name is required.");
  }
  if (!data.store_id) {
    throw new Error("Store is required.");
  }
  if (!data.discount_type_id) {
    throw new Error("Discount type is required.");
  }

  const discountType = await getDiscountTypeById(data.discount_type_id);

  if (!Number.isFinite(data.discount_value) || data.discount_value <= 0) {
    throw new Error("Discount value must be a positive number.");
  }
  if (discountType.code === "PERCENT" && data.discount_value > 100) {
    throw new Error("Percentage discount value cannot exceed 100.");
  }
  if (!Number.isFinite(data.min_bill_amount) || data.min_bill_amount < 0) {
    throw new Error("Minimum bill amount cannot be negative.");
  }
  if (!Number.isFinite(data.max_discount_amount) || data.max_discount_amount <= 0) {
    throw new Error("Maximum discount amount must be a positive number.");
  }
  if (!data.discount_from) {
    throw new Error("Discount start date is required.");
  }

  const discount = discountRepo.create({
    discount_name: discountName,
    discount_value: data.discount_value,
    min_bill_amount: data.min_bill_amount,
    max_discount_amount: data.max_discount_amount,
    discount_from: data.discount_from,
    discount_to: data.discount_to ?? null,
    description: data.description,
    is_active: true,
    created_at: new Date(),
    created_by: userId,
    updated_at: null,
    store_id: data.store_id,
    discount_type_id: data.discount_type_id,
  });

  try {
    return await discountRepo.save(discount);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error("A discount with this name already exists for this store.");
    }
    throw err;
  }
};

// ======================================================
// GET ACTIVE, CURRENTLY-VALID DISCOUNTS FOR A STORE
// ======================================================
export const getActiveDiscountsForStoreService = async (store_id: number) => {
  const now = new Date();
  return await discountRepo
    .createQueryBuilder("discount")
    .leftJoinAndSelect("discount.discountType", "discountType")
    .where("discount.store_id = :store_id", { store_id })
    .andWhere("discount.is_active = true")
    .andWhere("discount.discount_from <= :now", { now })
    .andWhere("(discount.discount_to IS NULL OR discount.discount_to >= :now)", { now })
    .orderBy("discount.discount_id", "DESC")
    .getMany();
};

// ======================================================
// GET ALL DISCOUNTS FOR A STORE (active + inactive)
// ======================================================
export const getAllDiscountsForStoreService = async (store_id: number) => {
  return await discountRepo.find({
    where: { store_id },
    relations: ["discountType", "store"],
    order: { discount_id: "DESC" },
  });
};

// ======================================================
// GET DISCOUNT BY ID
// ======================================================
export const getDiscountByIdService = async (discount_id: number) => {
  const discount = await discountRepo.findOne({
    where: { discount_id },
    relations: ["discountType", "store"],
  });
  if (!discount) {
    throw new Error("Discount not found.");
  }
  return discount;
};


// ======================================================
// GET DISCOUNT BY NAME
// ======================================================
export const getDiscountByNameForStore = async (discount_name: string,store_id: number) => {
    const name = discount_name.trim();

    if (!name) {
        throw new Error("Discount name is required.");
    }

    const discount = await discountRepo
        .createQueryBuilder("discount")
        .leftJoinAndSelect(
            "discount.discountType",
            "discountType"
        )
        .leftJoinAndSelect(
            "discount.store",
            "store"
        )
        .where(
            "LOWER(discount.discount_name) = LOWER(:discount_name)",
            { discount_name: name }
        )
        .andWhere(
            "discount.store_id = :store_id",
            { store_id }
        )
        .andWhere(
            "discount.is_active = :is_active",
            { is_active: true }
        )
        .getOne();

    if (!discount) {
        throw new Error(
            "Discount not found for this store."
        );
    }

    return discount;
};

// ======================================================
// UPDATE DISCOUNT
// ======================================================

export const updateDiscountService = async (discount_id: number, data: Partial<DiscountInput>, userId: number) => {
  const discount = await discountRepo.findOne({
    where: { discount_id },
    relations: ["discountType"],
  });
  if (!discount) {
    throw new Error("Discount not found.");
  }

  if (data.discount_name !== undefined) {
    const discountName = data.discount_name.trim();
    if (!discountName) {
      throw new Error("Discount name is required.");
    }
    discount.discount_name = discountName;
  }

  if (data.discount_type_id !== undefined && data.discount_type_id !== discount.discount_type_id) {
    discount.discountType = await getDiscountTypeById(data.discount_type_id);
    discount.discount_type_id = data.discount_type_id;
  }

  if (data.discount_value !== undefined) {
    if (!Number.isFinite(data.discount_value) || data.discount_value <= 0) {
      throw new Error("Discount value must be a positive number.");
    }
    discount.discount_value = data.discount_value;
  }
  if (discount.discountType.code === "PERCENT" && Number(discount.discount_value) > 100) {
    throw new Error("Percentage discount value cannot exceed 100.");
  }
  if (data.min_bill_amount !== undefined) discount.min_bill_amount = data.min_bill_amount;
  if (data.max_discount_amount !== undefined) discount.max_discount_amount = data.max_discount_amount;
  if (data.discount_from !== undefined) discount.discount_from = data.discount_from;
  if (data.discount_to !== undefined) discount.discount_to = data.discount_to;
  if (data.description !== undefined) discount.description = data.description;

  discount.updated_at = new Date();
  discount.updated_by = userId;

  try {
    return await discountRepo.save(discount);
  } catch (err) {
    if (isUniqueConstraintError(err)) {
      throw new Error("A discount with this name already exists for this store.");
    }
    throw err;
  }
};

// ======================================================
// deactivatediscounts
// ======================================================
export const setDiscountActiveService = async (
  discount_id: number,
  is_active: boolean,
  userId: number
) => {
  const discount = await discountRepo.findOne({ where: { discount_id } });
  if (!discount) {
    throw new Error("Discount not found.");
  }
  discount.is_active = is_active;
  discount.updated_at = new Date();
  discount.updated_by = userId;
  return await discountRepo.save(discount);
};

// ======================================================
// validate a discount against a bill subtotal and return the amount to deduct.
// ======================================================
export const resolveDiscountAmount = async (
  discount: Discount & { discountType: DiscountType },
  subtotal: number
): Promise<number> => {
  const now = new Date();

  if (!discount.is_active) {
    throw new Error("This discount is no longer active.");
  }
  if (new Date(discount.discount_from) > now) {
    throw new Error("This discount is not active yet.");
  }
  if (discount.discount_to && new Date(discount.discount_to) < now) {
    throw new Error("This discount has expired.");
  }
  if (subtotal < Number(discount.min_bill_amount)) {
    throw new Error(
      `Bill subtotal of ${subtotal} does not meet the minimum of ${discount.min_bill_amount} required for this discount.`
    );
  }

  const code = discount.discountType.code;
  let raw: number;
  if (code === "PERCENT") {
    raw = (subtotal * Number(discount.discount_value)) / 100;
  } else {
    raw = Number(discount.discount_value);
  }

  const capped = Math.min(raw, Number(discount.max_discount_amount), subtotal);
  return Math.round(capped * 100) / 100;
};

