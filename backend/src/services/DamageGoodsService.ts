import { AppDataSource } from "../datasource.js";
import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";
import { ReferenceType } from "../entity/MasterReference.js";

const damagedGoodsRepository = AppDataSource.getRepository(DamagedGoods);

// Helper function to resolve reference type IDs safely inside transactions
const getReferenceTypeId = async (
    transactionalEntityManager: any,
    code: string
): Promise<number> => {
    const refType = await transactionalEntityManager.findOne(ReferenceType, {
        where: { code, is_active: true }
    });
    if (!refType) {
        throw new Error(`Reference type with code '${code}' not found or inactive.`);
    }
    return refType.reference_type_id;
};

export const createDamagedGoodsService = async (
    damagedGoodsData: Partial<DamagedGoods> & {
        movement_type_id: number;
    }
) => {
    const inventoryId = damagedGoodsData.inventory_id;
    const quantity = damagedGoodsData.qty;
    const unitCost = damagedGoodsData.unit_cost;
    const movementTypeId = damagedGoodsData.movement_type_id;
    const userId = damagedGoodsData.created_by;

    if (!inventoryId || !Number.isInteger(inventoryId) || inventoryId <= 0) {
        throw new Error("Valid inventory ID is required");
    }

    if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity must be a positive integer");
    }

    if (unitCost === undefined || !Number.isFinite(unitCost) || unitCost < 0) {
        throw new Error("Invalid unit cost");
    }

    if (!movementTypeId || !Number.isInteger(movementTypeId) || movementTypeId <= 0) {
        throw new Error("Valid movement type ID is required");
    }

    if (!userId || !Number.isInteger(userId) || userId <= 0) {
        throw new Error("Valid user ID is required");
    }

    return await AppDataSource.transaction(
        async (transactionalEntityManager) => {
            // Get reference type ID for adding damaged goods
            const refTypeId = await getReferenceTypeId(transactionalEntityManager, "DAMADD");

            // Acquire pessimistic write lock to prevent race conditions during inventory updates
            const inventory = await transactionalEntityManager.findOne(Inventory, {
                where: { inventory_id: inventoryId },
                lock: { mode: "pessimistic_write" }
            });

            if (!inventory) {
                throw new Error("Inventory not found");
            }

            if (!inventory.is_active) {
                throw new Error("Inventory is inactive");
            }

            if (inventory.qty < quantity) {
                throw new Error(
                    `Insufficient stock. Available quantity: ${inventory.qty}`
                );
            }

            // Decrement inventory stock
            inventory.qty -= quantity;
            inventory.updated_at = new Date();
            inventory.updated_by = userId;

            await transactionalEntityManager.save(Inventory, inventory);

            const now = new Date();

            const damagedGoods = transactionalEntityManager.create(DamagedGoods, {
                inventory_id: inventoryId,
                qty: quantity,
                reason: damagedGoodsData.reason ?? null,
                unit_cost: unitCost,
                loss_value: quantity * unitCost,
                is_active: true,
                created_at: now,
                created_by: userId,
                updated_at: null,
                updated_by: null
            });

            const savedDamage = await transactionalEntityManager.save(
                DamagedGoods,
                damagedGoods
            );

            // Create stock movement record using resolved reference_type_id
            const stockMovement = transactionalEntityManager.create(StockMovement, {
                inventory_id: inventoryId,
                movement_type_id: movementTypeId,
                reference_type_id: refTypeId,
                quantity_change: -quantity,
                reference_type: "DAMAGED_GOODS",
                reference_id: savedDamage.damage_id,
                is_active: true,
                created_at: now,
                created_by: userId,
                updated_at: now,
                updated_by: userId
            });

            await transactionalEntityManager.save(StockMovement, stockMovement);

            return savedDamage;
        }
    );
};

export const getAllDamagedGoodsService = async () => {
    return await damagedGoodsRepository.find({
        where: { is_active: true },
        relations: [
            "inventory",
            "inventory.product",
            "inventory.store"
        ],
        order: { damage_id: "ASC" }
    });
};

export const getDamagedGoodsByIdService = async (damageId: number) => {
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

export const getDamagedGoodsByInventoryService = async (inventoryId: number) => {
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
        order: { damage_id: "ASC" }
    });
};

export const updateDamagedGoodsService = async (
    damageId: number,
    qty: number,
    reason: string | null,
    unitCost: number,
    userId: number,
    movementTypeId: number
) => {
    if (!Number.isInteger(qty) || qty <= 0) {
        throw new Error("Quantity must be a positive integer");
    }

    if (!Number.isFinite(unitCost) || unitCost < 0) {
        throw new Error("Invalid unit cost");
    }

    return await AppDataSource.transaction(
        async (transactionalEntityManager) => {
            const refTypeId = await getReferenceTypeId(transactionalEntityManager, "DAMED");

            const damagedGoods = await transactionalEntityManager.findOne(
                DamagedGoods,
                {
                    where: {
                        damage_id: damageId,
                        is_active: true
                    }
                }
            );

            if (!damagedGoods) {
                return null;
            }

            const inventory = await transactionalEntityManager.findOne(
                Inventory,
                {
                    where: { inventory_id: damagedGoods.inventory_id },
                    lock: { mode: "pessimistic_write" }
                }
            );

            if (!inventory) {
                throw new Error("Inventory not found");
            }

            const oldQty = damagedGoods.qty;
            const quantityDifference = qty - oldQty;

            if (
                quantityDifference > 0 &&
                inventory.qty < quantityDifference
            ) {
                throw new Error(
                    `Insufficient stock. Available quantity: ${inventory.qty}`
                );
            }

            inventory.qty -= quantityDifference;
            inventory.updated_at = new Date();
            inventory.updated_by = userId;

            await transactionalEntityManager.save(Inventory, inventory);

            damagedGoods.qty = qty;
            damagedGoods.reason = reason;
            damagedGoods.unit_cost = unitCost;
            damagedGoods.loss_value = qty * unitCost;
            damagedGoods.updated_at = new Date();
            damagedGoods.updated_by = userId;

            const updatedDamage = await transactionalEntityManager.save(
                DamagedGoods,
                damagedGoods
            );

            if (quantityDifference !== 0) {
                const stockMovement = transactionalEntityManager.create(
                    StockMovement,
                    {
                        inventory_id: damagedGoods.inventory_id,
                        movement_type_id: movementTypeId,
                        reference_type_id: refTypeId,
                        quantity_change: -quantityDifference,
                        reference_type: "DAMAGED_GOODS",
                        reference_id: damagedGoods.damage_id,
                        is_active: true,
                        created_at: new Date(),
                        created_by: userId,
                        updated_at: new Date(),
                        updated_by: userId
                    }
                );

                await transactionalEntityManager.save(
                    StockMovement,
                    stockMovement
                );
            }

            return updatedDamage;
        }
    );
};

export const deactivateDamagedGoodsService = async (
    damageId: number,
    userId: number,
    reversalMovementTypeId: number
) => {
    return await AppDataSource.transaction(
        async (transactionalEntityManager) => {
            const refTypeId = await getReferenceTypeId(transactionalEntityManager, "DAMD");

            const damagedGoods = await transactionalEntityManager.findOne(
                DamagedGoods,
                {
                    where: {
                        damage_id: damageId,
                        is_active: true
                    }
                }
            );

            if (!damagedGoods) {
                return null;
            }

            const inventory = await transactionalEntityManager.findOne(
                Inventory,
                {
                    where: { inventory_id: damagedGoods.inventory_id },
                    lock: { mode: "pessimistic_write" }
                }
            );

            if (!inventory) {
                throw new Error("Inventory not found");
            }

            inventory.qty += damagedGoods.qty;
            inventory.updated_at = new Date();
            inventory.updated_by = userId;

            await transactionalEntityManager.save(Inventory, inventory);

            damagedGoods.is_active = false;
            damagedGoods.updated_at = new Date();
            damagedGoods.updated_by = userId;

            const deactivatedDamage = await transactionalEntityManager.save(
                DamagedGoods,
                damagedGoods
            );

            const stockMovement = transactionalEntityManager.create(
                StockMovement,
                {
                    inventory_id: damagedGoods.inventory_id,
                    movement_type_id: reversalMovementTypeId,
                    reference_type_id: refTypeId,
                    quantity_change: damagedGoods.qty,
                    reference_type: "DAMAGED_GOODS",
                    reference_id: damagedGoods.damage_id,
                    is_active: true,
                    created_at: new Date(),
                    created_by: userId,
                    updated_at: new Date(),
                    updated_by: userId
                }
            );

            await transactionalEntityManager.save(
                StockMovement,
                stockMovement
            );

            return deactivatedDamage;
        }
    );
};