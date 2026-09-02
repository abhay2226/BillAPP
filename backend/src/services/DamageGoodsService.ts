import { AppDataSource } from "../datasource.js";
import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";

const damagedGoodsRepository =
    AppDataSource.getRepository(DamagedGoods);

export const createDamagedGoodsService = async (
    damagedGoodsData: Partial<DamagedGoods>
) => {
    const lossValue =
        Number(damagedGoodsData.qty) *
        Number(damagedGoodsData.unit_cost);

    const damagedGoods = damagedGoodsRepository.create({
        ...damagedGoodsData,
        loss_value: lossValue,
        is_active: true,
        created_at: new Date()
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

    const lossValue = qty * unitCost;

    damagedGoods.qty = qty;
    damagedGoods.reason = reason;
    damagedGoods.unit_cost = unitCost;
    damagedGoods.loss_value = lossValue;

    damagedGoods.created_by = damagedGoods.created_by;
    
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

    return await damagedGoodsRepository.save(damagedGoods);
};