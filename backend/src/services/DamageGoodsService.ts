import { AppDataSource } from "../datasource.js";
import type { EntityManager } from "typeorm";

import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";
import { MovementType } from "../entity/MasterMovementType.js";
import { ReferenceType } from "../entity/MasterReference.js";

import { createAuditRecordService } from "./AuditServices.js";


const getMovementType = async (
    manager: EntityManager,
    code: string
): Promise<MovementType> => {

    const movementType = await manager.findOne(MovementType, {
        where: {
            code,
            is_active: true
        }
    });

    if (!movementType) {
        throw new Error(
            `Movement type with code '${code}' not found or inactive`
        );
    }

    return movementType;
};

const getReferenceType = async (
    manager: EntityManager,
    code: string
): Promise<ReferenceType> => {

    const referenceType = await manager.findOne(ReferenceType, {
        where: {
            code,
            is_active: true
        }
    });

    if (!referenceType) {
        throw new Error(
            `Reference type with code '${code}' not found or inactive`
        );
    }

    return referenceType;
};


// ======================================================
// REPOSITORIES
// ======================================================

const damageRepository =
    AppDataSource.getRepository(DamagedGoods);

const inventoryRepository =
    AppDataSource.getRepository(Inventory);


// ======================================================
// VALIDATE ID
// ======================================================

const validateId = (
    value: number,
    message: string
): void => {

    if (
        !Number.isInteger(value) ||
        value <= 0
    ) {
        throw new Error(message);
    }
};


// ======================================================
// VALIDATE QUANTITY
// ======================================================

const validateQuantity = (
    value: number
): void => {

    if (
        !Number.isInteger(value) ||
        value <= 0
    ) {
        throw new Error(
            "Quantity must be a positive integer"
        );
    }
};


// ======================================================
// CREATE DAMAGED GOODS
// ======================================================

export const createDamagedGoodsService = async (
    inventoryId: number,
    qty: number,
    reason: string,
    unitCost: number,
    userId: number,
    sessionId: number
) => {
    validateId(inventoryId, "Valid inventory ID is required");
    validateQuantity(qty);
    validateId(userId, "Valid user ID is required");
    validateId(sessionId, "Valid session ID is required");

    if (!reason || reason.trim() === "") {
        throw new Error("Damage reason is required");
    }
    if (typeof unitCost !== "number" || unitCost < 0) {
        throw new Error("Valid unit cost is required");
    }

    return await AppDataSource.manager.transaction(async (manager) => {
        const inventory = await manager.findOne(Inventory, {
            where: { inventory_id: inventoryId, is_active: true }
        });
        if (!inventory) throw new Error("Active inventory record not found");
        if (inventory.qty < qty) {
            throw new Error(`Insufficient stock. Available stock: ${inventory.qty}`);
        }

        const lossValue = qty * unitCost;
        const now = new Date();

        inventory.qty -= qty;
        inventory.updated_at = now;
        inventory.updated_by = userId;
        await manager.save(Inventory, inventory);

        const inventoryAudit = await createAuditRecordService(manager, {
            tableName: "transactions_inventory",
            recordId: inventory.inventory_id,
            actionTypeName: "UPDATE",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        const damage = manager.create(DamagedGoods, {
            inventory_id: inventory.inventory_id,
            qty,
            reason: reason.trim(),
            unit_cost: unitCost,
            loss_value: lossValue,
            is_active: true,
            created_at: now,
            created_by: userId,
            updated_at: now,
            updated_by: userId
        });
        await manager.save(DamagedGoods, damage);

        const damageAudit = await createAuditRecordService(manager, {
            tableName: "transactions_damaged_goods",
            recordId: damage.damage_id,
            actionTypeName: "INSERT",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        const movementType = await getMovementType(manager, "DAMAGE");
        const referenceType = await getReferenceType(manager, "DAMADD");
        const stockMovement = manager.create(StockMovement, {
            inventory_id: inventory.inventory_id,
            movement_type_id: movementType.movement_type_id,
            reference_type_id: referenceType.reference_type_id,
            referenceType,
            quantity_change: -qty,
            reference_id: damage.damage_id,
            is_active: true,
            created_at: now,
            created_by: userId,
            updated_at: now,
            updated_by: userId
        });
        const savedMovement = await manager.save(StockMovement, stockMovement);

        const movementAudit = await createAuditRecordService(manager, {
            tableName: "transactions_stock_movement",
            recordId: savedMovement.movement_id,
            actionTypeName: "INSERT",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        return { inventory, damage, audits: [inventoryAudit, damageAudit, movementAudit] };
    });
};


// ======================================================
// GET DAMAGE BY ID
// ======================================================

export const getDamagedGoodsByIdService =
    async (
        damageId: number
    ) => {

        validateId(
            damageId,
            "Invalid damage ID"
        );


        return await damageRepository.findOne({

            where: {
                damage_id:
                    damageId,

                is_active:
                    true
            },

            relations: {
                inventory: true
            }
        });
    };


// ======================================================
// GET ALL ACTIVE DAMAGE RECORDS
// ======================================================

export const getAllDamagedGoodsService =
    async () => {

        return await damageRepository.find({

            where: {
                is_active:
                    true
            },

            relations: {
                inventory: true
            },

            order: {
                damage_id:
                    "DESC"
            }
        });
    };


// ======================================================
// GET ALL DAMAGE HISTORY
// ======================================================

export const getAllDamagedGoodsHistoryService =
    async () => {

        return await damageRepository.find({

            relations: {
                inventory: true
            },

            order: {
                damage_id:
                    "DESC"
            }
        });
    };


// ======================================================
// GET DAMAGE BY INVENTORY
// ======================================================

export const getDamagedGoodsByInventoryService =
    async (
        inventoryId: number
    ) => {

        validateId(
            inventoryId,
            "Invalid inventory ID"
        );


        return await damageRepository.find({

            where: {
                inventory_id:
                    inventoryId,

                is_active:
                    true
            },

            relations: {
                inventory: true
            },

            order: {
                damage_id:
                    "DESC"
            }
        });
    };


// ======================================================
// UPDATE DAMAGED GOODS
// ======================================================

export const updateDamagedGoodsService = async (
    damageId: number,
    qty: number,
    reason: string,
    unitCost: number,
    userId: number,
    sessionId: number
) => {
    validateId(damageId, "Invalid damage ID");
    validateQuantity(qty);
    validateId(userId, "Valid user ID is required");
    validateId(sessionId, "Valid session ID is required");

    if (!reason || reason.trim() === "") throw new Error("Damage reason is required");
    if (typeof unitCost !== "number" || unitCost < 0) throw new Error("Valid unit cost is required");

    return await AppDataSource.manager.transaction(async (manager) => {
        const damage = await manager.findOne(DamagedGoods, {
            where: { damage_id: damageId, is_active: true }
        });
        if (!damage) throw new Error("Active damaged goods record not found");

        const inventory = await manager.findOne(Inventory, {
            where: { inventory_id: damage.inventory_id, is_active: true }
        });
        if (!inventory) throw new Error("Active inventory record not found");

        const quantityDifference = qty - damage.qty;
        if (quantityDifference > 0 && inventory.qty < quantityDifference) {
            throw new Error(`Insufficient stock. Available stock: ${inventory.qty}`);
        }

        const now = new Date();

        // UPDATE INVENTORY
        inventory.qty -= quantityDifference;
        inventory.updated_at = now;
        inventory.updated_by = userId;
        await manager.save(Inventory, inventory);

        const inventoryAudit = await createAuditRecordService(manager, {
            tableName: "transactions_inventory",
            recordId: inventory.inventory_id,
            actionTypeName: "UPDATE",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        // UPDATE DAMAGE
        damage.qty = qty;
        damage.reason = reason.trim();
        damage.unit_cost = unitCost;
        damage.loss_value = qty * unitCost;
        damage.updated_at = now;
        damage.updated_by = userId;
        await manager.save(DamagedGoods, damage);

        const damageAudit = await createAuditRecordService(manager, {
            tableName: "transactions_damaged_goods",
            recordId: damage.damage_id,
            actionTypeName: "UPDATE",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        // CREATE STOCK MOVEMENT (DAMED)
        const movementType = await getMovementType(manager, "DAMAGE");
        const referenceType = await getReferenceType(manager, "DAMED");
        const stockMovement = manager.create(StockMovement, {
            inventory_id: inventory.inventory_id,
            movement_type_id: movementType.movement_type_id,
            reference_type_id: referenceType.reference_type_id,
            referenceType,
            quantity_change: -quantityDifference,
            reference_id: damage.damage_id,
            is_active: true,
            created_at: now,
            created_by: userId,
            updated_at: now,
            updated_by: userId
        });
        const savedMovement = await manager.save(StockMovement, stockMovement);

        const movementAudit = await createAuditRecordService(manager, {
            tableName: "transactions_stock_movement",
            recordId: savedMovement.movement_id,
            actionTypeName: "INSERT",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        return { inventory, damage, audits: [inventoryAudit, damageAudit, movementAudit] };
    });
};



// ======================================================
// DEACTIVATE DAMAGE RECORD
// ======================================================

export const deactivateDamagedGoodsService = async (
    damageId: number,
    userId: number,
    sessionId: number
) => {
    validateId(damageId, "Invalid damage ID");
    validateId(userId, "Valid user ID is required");
    validateId(sessionId, "Valid session ID is required");

    return await AppDataSource.manager.transaction(async (manager) => {
        const damage = await manager.findOne(DamagedGoods, {
            where: { damage_id: damageId, is_active: true }
        });
        if (!damage) throw new Error("Active damaged goods record not found");

        const inventory = await manager.findOne(Inventory, {
            where: { inventory_id: damage.inventory_id, is_active: true }
        });
        if (!inventory) throw new Error("Active inventory record not found");

        const now = new Date();

        // RESTORE INVENTORY
        inventory.qty += damage.qty;
        inventory.updated_at = now;
        inventory.updated_by = userId;
        await manager.save(Inventory, inventory);

        const inventoryAudit = await createAuditRecordService(manager, {
            tableName: "transactions_inventory",
            recordId: inventory.inventory_id,
            actionTypeName: "UPDATE",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        // DEACTIVATE DAMAGE
        damage.is_active = false;
        damage.updated_at = now;
        damage.updated_by = userId;
        await manager.save(DamagedGoods, damage);

        const damageAudit = await createAuditRecordService(manager, {
            tableName: "transactions_damaged_goods",
            recordId: damage.damage_id,
            actionTypeName: "DELETE",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        // CREATE STOCK MOVEMENT (DAMD)
        const movementType = await getMovementType(manager, "DAMAGE");
        const referenceType = await getReferenceType(manager, "DAMD");
        const stockMovement = manager.create(StockMovement, {
            inventory_id: inventory.inventory_id,
            movement_type_id: movementType.movement_type_id,
            reference_type_id: referenceType.reference_type_id,
            referenceType,
            quantity_change: damage.qty, // restoring stock
            reference_id: damage.damage_id,
            is_active: true,
            created_at: now,
            created_by: userId,
            updated_at: now,
            updated_by: userId
        });
        const savedMovement = await manager.save(StockMovement, stockMovement);

        const movementAudit = await createAuditRecordService(manager, {
            tableName: "transactions_stock_movement",
            recordId: savedMovement.movement_id,
            actionTypeName: "INSERT",
            userId,
            storeId: inventory.store_id,
            sessionId
        });

        return { inventory, damage, audits: [inventoryAudit, damageAudit, movementAudit] };
    });
};



// ======================================================
// GET DAMAGE RECORDS BY DATE RANGE
// ======================================================

export const getDamagedGoodsByDateRangeService =
    async (
        fromDate: Date,
        toDate: Date
    ) => {

        if (
            !(fromDate instanceof Date) ||
            isNaN(fromDate.getTime())
        ) {
            throw new Error(
                "Invalid from date"
            );
        }


        if (
            !(toDate instanceof Date) ||
            isNaN(toDate.getTime())
        ) {
            throw new Error(
                "Invalid to date"
            );
        }


        if (fromDate > toDate) {
            throw new Error(
                "From date cannot be greater than to date"
            );
        }


        return await damageRepository
            .createQueryBuilder("damage")

            .leftJoinAndSelect(
                "damage.inventory",
                "inventory"
            )

            .where(
                "damage.created_at BETWEEN :fromDate AND :toDate",
                {
                    fromDate,
                    toDate
                }
            )

            .andWhere(
                "damage.is_active = :isActive",
                {
                    isActive:
                        true
                }
            )

            .orderBy(
                "damage.created_at",
                "DESC"
            )

            .getMany();
    };

