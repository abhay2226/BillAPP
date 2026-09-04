import { AppDataSource } from "../datasource.js";
import { EntityManager } from "typeorm";
import { Discount } from "../entity/TransactionsDiscount.js";
import { DiscountType } from "../entity/MasterDiscountType.js";
import { Store } from "../entity/TransactionsStore.js";

const discountRepository = AppDataSource.getRepository(Discount);
const discountTypeRepository = AppDataSource.getRepository(DiscountType);

export type DiscountInput = {
    discount_name: string;
    discount_value: number;
    min_bill_amount: number;
    max_discount_amount: number;
    discount_from: Date;
    discount_to?: Date | null;
    description: string;
};

// CREATE DISCOUNT

export const createDiscountService = async (
    storeId: number,
    discountTypeId: number,
    data: DiscountInput,
    userId: number
) => {
    if (!Number.isInteger(storeId) || storeId <= 0) {
        throw new Error("Valid store ID is required");
    }

    if (!Number.isInteger(discountTypeId) || discountTypeId <= 0) {
        throw new Error("Valid discount type ID is required");
    }

    if (!data.discount_name || !data.discount_name.trim()) {
        throw new Error("Discount name is required");
    }

    if (!Number.isFinite(data.discount_value) || data.discount_value <= 0) {
        throw new Error("Discount value must be a positive number");
    }

    if (!Number.isFinite(data.min_bill_amount) || data.min_bill_amount < 0) {
        throw new Error("Invalid minimum bill amount");
    }

    if (!Number.isFinite(data.max_discount_amount) || data.max_discount_amount <= 0) {
        throw new Error("Invalid maximum discount amount");
    }

    if (!data.discount_from) {
        throw new Error("Discount start date is required");
    }

    if (data.discount_to && data.discount_to <= data.discount_from) {
        throw new Error("Discount end date must be after the start date");
    }

    const discountType = await discountTypeRepository.findOne({
        where: { discount_type_id: discountTypeId, is_active: true }
    });

    if (!discountType) {
        throw new Error("Discount type not found or inactive");
    }

    const discount = discountRepository.create({
        discount_name: data.discount_name.trim(),
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
        updated_by: null,
        // Discount's store_id/discount_type_id are relation properties with no
        // separate scalar FK column on the entity, so they're set via a
        // minimal object carrying just the PK rather than a plain number.
        store_id: { store_id: storeId } as Store,
        discount_type_id: discountType
    });

    return await discountRepository.save(discount);
};

// GET ALL DISCOUNTS

export const getAllDiscountsService = async () => {
    return await discountRepository.find({
        relations: ["store_id", "discount_type_id"],
        order: { discount_id: "DESC" }
    });
};

// GET DISCOUNT BY ID

export const getDiscountByIdService = async (discountId: number) => {
    return await discountRepository.findOne({
        where: { discount_id: discountId },
        relations: ["store_id", "discount_type_id"]
    });
};

// GET CURRENTLY REDEEMABLE DISCOUNTS FOR A STORE (active, in-window)
// Uses a query builder because store_id is a relation property in TS
// but a plain integer column in the DB — this filters on the real column.

export const getActiveDiscountsForStoreService = async (storeId: number) => {
    const now = new Date();

    return await discountRepository
        .createQueryBuilder("discount")
        .leftJoinAndSelect("discount.discount_type_id", "discountType")
        .where("discount.store_id = :storeId", { storeId })
        .andWhere("discount.is_active = :isActive", { isActive: true })
        .andWhere("discount.discount_from <= :now", { now })
        .andWhere(
            "(discount.discount_to IS NULL OR discount.discount_to >= :now)",
            { now }
        )
        .getMany();
};

// UPDATE DISCOUNT

export const updateDiscountService = async (
    discountId: number,
    data: Partial<DiscountInput> & { discount_type_id?: number },
    userId: number
) => {
    const discount = await discountRepository.findOne({
        where: { discount_id: discountId, is_active: true }
    });

    if (!discount) {
        throw new Error("Discount not found or inactive");
    }

    if (data.discount_type_id !== undefined) {
        const discountType = await discountTypeRepository.findOne({
            where: { discount_type_id: data.discount_type_id, is_active: true }
        });

        if (!discountType) {
            throw new Error("Discount type not found or inactive");
        }

        discount.discount_type_id = discountType;
    }

    if (data.discount_name !== undefined) {
        discount.discount_name = data.discount_name.trim();
    }

    if (data.discount_value !== undefined) {
        if (!Number.isFinite(data.discount_value) || data.discount_value <= 0) {
            throw new Error("Discount value must be a positive number");
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

    if (
        discount.discount_to &&
        discount.discount_to <= discount.discount_from
    ) {
        throw new Error("Discount end date must be after the start date");
    }

    discount.updated_at = new Date();
    discount.updated_by = userId;

    return await discountRepository.save(discount);
};

// DEACTIVATE DISCOUNT

export const deactivateDiscountService = async (
    discountId: number,
    userId: number
) => {
    const discount = await discountRepository.findOne({
        where: { discount_id: discountId, is_active: true }
    });

    if (!discount) {
        throw new Error("Discount not found or already inactive");
    }

    discount.is_active = false;
    discount.updated_at = new Date();
    discount.updated_by = userId;

    return await discountRepository.save(discount);
};

// PURE CALCULATION — given a loaded discount and a subtotal, work out the
// deduction. Exported on its own so it's independently testable.

export const calculateDiscountAmount = (
    discount: Discount,
    subtotal: number
): number => {
    let amount: number;

    switch (discount.discount_type_id.code) {
        case "FLAT":
            amount = discount.discount_value;
            break;
        case "PERCENT":
            amount = (subtotal * discount.discount_value) / 100;
            break;
        default:
            throw new Error(
                `Unsupported discount type code: ${discount.discount_type_id.code}`
            );
    }

    // Never exceed the configured cap, and never exceed the bill itself
    amount = Math.min(amount, discount.max_discount_amount, subtotal);

    return Math.round(amount * 100) / 100;
};

// VALIDATE A DISCOUNT AGAINST A SPECIFIC BILL AND RETURN THE AMOUNT TO APPLY
// Accepts an optional transactional EntityManager so BillServices can call
// this from inside its own transaction instead of opening a second one.

export const resolveDiscountForBillService = async (
    discountId: number,
    storeId: number,
    subtotal: number,
    entityManager: EntityManager = AppDataSource.manager
) => {
    const discount = await entityManager.findOne(Discount, {
        where: { discount_id: discountId, is_active: true },
        relations: ["store_id", "discount_type_id"]
    });

    if (!discount) {
        throw new Error("Discount not found or inactive");
    }

    if (discount.store_id.store_id !== storeId) {
        throw new Error("Discount does not belong to this store");
    }

    const now = new Date();

    if (discount.discount_from > now) {
        throw new Error("Discount is not active yet");
    }

    if (discount.discount_to && discount.discount_to < now) {
        throw new Error("Discount has expired");
    }

    if (subtotal < discount.min_bill_amount) {
        throw new Error(
            `Bill subtotal of ${subtotal} does not meet the minimum of ${discount.min_bill_amount} required for this discount`
        );
    }

    const discountAmount = calculateDiscountAmount(discount, subtotal);

    return { discount, discountAmount };
};
