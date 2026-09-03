import { AppDataSource } from "../datasource.js";
import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";

const damagedGoodsRepository =
    AppDataSource.getRepository(DamagedGoods);

export const createDamagedGoodsService = async (
    damagedGoodsData: Partial<DamagedGoods>
) => {
    const inventoryId = damagedGoodsData.inventory_id;
    const quantity = damagedGoodsData.qty;
    const unitCost = damagedGoodsData.unit_cost;

    if (
        inventoryId === undefined ||
        !Number.isInteger(inventoryId) ||
        inventoryId <= 0
    ) {
        throw new Error("Valid inventory ID is required");
    }

    if (
        quantity === undefined ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        throw new Error(
            "Quantity must be a positive integer"
        );
    }

    if (
        unitCost === undefined ||
        !Number.isFinite(unitCost) ||
        unitCost < 0
    ) {
        throw new Error("Invalid unit cost");
    }

    const now = new Date();

    const damagedGoods = damagedGoodsRepository.create({
        inventory_id: inventoryId,
        qty: quantity,
        reason: damagedGoodsData.reason ?? null,
        unit_cost: unitCost,
        loss_value: quantity * unitCost,
        is_active: true,
        created_at: now,
        created_by: damagedGoodsData.created_by ?? null,
        updated_at: null,
        updated_by: null
    });

    return await damagedGoodsRepository.save(damagedGoods);
};

export const getAllDamagedGoodsService = async () => {
    return await damagedGoodsRepository.find({
        where: {
            is_active: true
        },
        relations: [
            "inventory",
            "inventory.product",
            "inventory.store"
        ],
        order: {
            damage_id: "ASC"
        }
    });
};

export const getDamagedGoodsByIdService = async (
    damageId: number
) => {
    return await damagedGoodsRepository.findOne({
        where: {
            damage_id: damageId,
            is_active: true
        },
        relations: [
            "inventory",
            "inventory.product",
            "inventory.store"
        ]
    });
};

export const getDamagedGoodsByInventoryService = async (
    inventoryId: number
) => {
    return await damagedGoodsRepository.find({
        where: {
            inventory_id: inventoryId,
            is_active: true
        },
        relations: [
            "inventory",
            "inventory.product",
            "inventory.store"
        ],
        order: {
            damage_id: "ASC"
        }
    });
};

export const updateDamagedGoodsService = async (
    damageId: number,
    qty: number,
    reason: string | null,
    unitCost: number,
    userId: number
) => {
    const damagedGoods =
        await damagedGoodsRepository.findOne({
            where: {
                damage_id: damageId,
                is_active: true
            }
        });

    if (!damagedGoods) {
        return null;
    }

    const now = new Date();

    damagedGoods.qty = qty;
    damagedGoods.reason = reason;
    damagedGoods.unit_cost = unitCost;
    damagedGoods.loss_value = qty * unitCost;
    damagedGoods.updated_at = now;
    damagedGoods.updated_by = userId;

    return await damagedGoodsRepository.save(damagedGoods);
};

export const deactivateDamagedGoodsService = async (
    damageId: number,
    userId: number
) => {
    const damagedGoods =
        await damagedGoodsRepository.findOne({
            where: {
                damage_id: damageId,
                is_active: true
            }
        });

    if (!damagedGoods) {
        return null;
    }

    damagedGoods.is_active = false;
    damagedGoods.updated_at = new Date();
    damagedGoods.updated_by = userId;

    return await damagedGoodsRepository.save(damagedGoods);
};