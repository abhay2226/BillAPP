import { AppDataSource } from "../datasource.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { DiscountType } from "../entity/MasterDiscountType.js";
import { Store } from "../entity/TransactionsStore.js";

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
export const createDiscountService = async (
  data: DiscountInput,
  userId: number
) => {
  if (!data.discount_name || !data.discount_name.trim()) {
    throw new Error("Discount name is required.");
  }
  if (!Number.isFinite(data.discount_value) || data.discount_value <= 0) {
    throw new Error("Discount value must be a positive number.");
  }
  if (!Number.isFinite(data.min_bill_amount) || data.min_bill_amount < 0) {
    throw new Error("Minimum bill amount must be zero or more.");
  }
  if (
    !Number.isFinite(data.max_discount_amount) ||
    data.max_discount_amount <= 0
  ) {
    throw new Error("Max discount amount must be a positive number.");
  }
  if (
    data.discount_to &&
    new Date(data.discount_to) <= new Date(data.discount_from)
  ) {
    throw new Error("discount_to must be after discount_from.");
  }

  const discountType = await discountTypeRepo.findOne({
    where: { discount_type_id: data.discount_type_id, is_active: true }
  });
  if (!discountType) {
    throw new Error("Discount type not found or inactive.");
  }
  // A PERCENT-style discount value has to be a sane percentage.
  if (
    discountType.code === "PERCENT" &&
    data.discount_value > 100
  ) {
    throw new Error("Percentage discount value cannot exceed 100.");
  }

  const store = await storeRepo.findOne({
    where: { store_id: data.store_id, is_active: true }
  });
  if (!store) {
    throw new Error("Store not found or inactive.");
  }

  const duplicate = await discountRepo.findOne({
    where: { discount_name: data.discount_name }
  });
  if (duplicate) {
    throw new Error("A discount with this name already exists.");
  }

  const discount = discountRepo.create({
    discount_name: data.discount_name,
    discount_value: data.discount_value,
    min_bill_amount: data.min_bill_amount,
    max_discount_amount: data.max_discount_amount,
    discount_from: data.discount_from,
    discount_to: data.discount_to ?? null,
    description: data.description,
    is_active: true,
    created_at: new Date(),
    updated_at: null,
    store_id: data.store_id ,
    discount_type_id: data.discount_type_id 
  });

  return await discountRepo.save(discount);
};

// ======================================================
// GET ACTIVE, CURRENTLY-VALID DISCOUNTS FOR A STORE
// ======================================================
export const getActiveDiscountsForStoreService = async (
  store_id: number
) => {
  const now = new Date();
  return await discountRepo
    .createQueryBuilder("discount")
    .leftJoinAndSelect("discount.discount_type_id", "discountType")
    .where("discount.store_id = :store_id", { store_id })
    .andWhere("discount.is_active = true")
    .andWhere("discount.discount_from <= :now", { now })
    .andWhere(
      "(discount.discount_to IS NULL OR discount.discount_to >= :now)",
      { now }
    )
    .orderBy("discount.discount_id", "DESC")
    .getMany();
};

// ======================================================
// GET DISCOUNT BY ID
// ======================================================
export const getDiscountByIdService = async (discount_id: number) => {
  const discount = await discountRepo.findOne({
    where: { 
        discount_id 

    },
    relations: ["discount_type_id", "store_id"]
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
export const updateDiscountService = async (
  discount_id: number,
  data: Partial<DiscountInput>,
  userId: number
) => {
  const discount = await discountRepo.findOne({ where: { discount_id } });
  if (!discount) {
    throw new Error("Discount not found.");
  }
  if (data.discount_value !== undefined) {
    if (!Number.isFinite(data.discount_value) || data.discount_value <= 0) {
      throw new Error("Discount value must be a positive number.");
    }
    discount.discount_value = data.discount_value;
  }
  if (data.min_bill_amount !== undefined) {
    discount.min_bill_amount = data.min_bill_amount;
  }
  if (data.max_discount_amount !== undefined) {
    discount.max_discount_amount = data.max_discount_amount;
  }
  if (data.discount_from !== undefined) {
    discount.discount_from = data.discount_from;
  }
  if (data.discount_to !== undefined) {
    discount.discount_to = data.discount_to;
  }
  if (data.description !== undefined) {
    discount.description = data.description;
  }
  discount.updated_at = new Date();
  discount.updated_by = userId;
  return await discountRepo.save(discount);
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