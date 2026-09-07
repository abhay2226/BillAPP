import { AppDataSource } from "../datasource.js";
import { DiscountType } from "../entity/MasterDiscountType.js";

const discountTypeRepo =
    AppDataSource.getRepository(DiscountType);

export interface DiscountTypeData {
    code: string;
    description: string;
    is_active?: boolean;
}

// ======================================================
// GET ALL ACTIVE DISCOUNT TYPES
// ======================================================
export async function getDiscountTypes() {
    return discountTypeRepo.find({
        where: {
            is_active: true
        },
        order: {
            discount_type_id: "ASC"
        }
    });
}

// ======================================================
// GET DISCOUNT TYPE BY ID
// ======================================================
export async function getDiscountTypeById(
    discountTypeId: number
) {
    const discountType = await discountTypeRepo.findOne({
        where: {
            discount_type_id: discountTypeId
        }
    });

    if (!discountType) {
        throw new Error("Discount type not found.");
    }

    return discountType;
}

// ======================================================
// GET DISCOUNT TYPE BY CODE
// ======================================================
export async function getDiscountTypeByCode(
    code: string
) {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
        throw new Error("Discount type code is required.");
    }

    const discountType = await discountTypeRepo.findOne({
        where: {
            code: normalizedCode,
            is_active: true
        }
    });

    if (!discountType) {
        throw new Error(
            "Discount type not found or inactive."
        );
    }

    return discountType;
}

// ======================================================
// CREATE DISCOUNT TYPE
// ======================================================
export async function createDiscountType(
    data: DiscountTypeData
) {
    const code = data.code.trim().toUpperCase();
    const description = data.description.trim();

    if (!code) {
        throw new Error("Discount type code is required.");
    }

    if (!description) {
        throw new Error(
            "Discount type description is required."
        );
    }

    const existingDiscountType =
        await discountTypeRepo.findOne({
            where: {
                code
            }
        });

    if (existingDiscountType) {
        throw new Error(
            "A discount type with this code already exists."
        );
    }

    const discountType = discountTypeRepo.create({
        code,
        description,
        is_active: data.is_active ?? true,
        created_at: new Date(),
        updated_at: null
    });

    return discountTypeRepo.save(discountType);
}

// ======================================================
// UPDATE DISCOUNT TYPE
// ======================================================
export async function updateDiscountType(
    discountTypeId: number,
    data: Partial<DiscountTypeData>
) {
    const discountType = await discountTypeRepo.findOne({
        where: {
            discount_type_id: discountTypeId
        }
    });

    if (!discountType) {
        throw new Error("Discount type not found.");
    }

    if (data.code !== undefined) {
        const code = data.code.trim().toUpperCase();

        if (!code) {
            throw new Error(
                "Discount type code cannot be empty."
            );
        }

        const duplicate = await discountTypeRepo.findOne({
            where: {
                code
            }
        });

        if (
            duplicate &&
            duplicate.discount_type_id !== discountTypeId
        ) {
            throw new Error(
                "A discount type with this code already exists."
            );
        }

        discountType.code = code;
    }

    if (data.description !== undefined) {
        const description = data.description.trim();

        if (!description) {
            throw new Error(
                "Discount type description cannot be empty."
            );
        }

        discountType.description = description;
    }

    if (data.is_active !== undefined) {
        discountType.is_active = data.is_active;
    }

    discountType.updated_at = new Date();

    return discountTypeRepo.save(discountType);
}

// ======================================================
// DEACTIVATE DISCOUNT TYPE
// ======================================================
export async function deactivateDiscountType(
    discountTypeId: number
) {
    const discountType = await discountTypeRepo.findOne({
        where: {
            discount_type_id: discountTypeId,
            is_active: true
        }
    });

    if (!discountType) {
        throw new Error(
            "Discount type not found or already inactive."
        );
    }

    discountType.is_active = false;
    discountType.updated_at = new Date();

    return discountTypeRepo.save(discountType);
}

// ======================================================
// ACTIVATE DISCOUNT TYPE
// ======================================================
export async function activateDiscountType(
    discountTypeId: number
) {
    const discountType = await discountTypeRepo.findOne({
        where: {
            discount_type_id: discountTypeId
        }
    });

    if (!discountType) {
        throw new Error("Discount type not found.");
    }

    discountType.is_active = true;
    discountType.updated_at = new Date();

    return discountTypeRepo.save(discountType);
}