
import { AppDataSource } from "../datasource.js";

import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { Audit } from "../entity/TransactionsAudit.js";

import { createAuditRecordService } from "./AuditServices.js";


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

export const createDamagedGoodsService =
    async (
        inventoryId: number,
        qty: number,
        reason: string,
        unitCost: number,
        userId: number,
        sessionId: number
    ) => {

        // ==================================================
        // VALIDATION
        // ==================================================

        validateId(
            inventoryId,
            "Valid inventory ID is required"
        );

        validateQuantity(qty);

        validateId(
            userId,
            "Valid user ID is required"
        );

        validateId(
            sessionId,
            "Valid session ID is required"
        );

        if (
            !reason ||
            reason.trim() === ""
        ) {
            throw new Error(
                "Damage reason is required"
            );
        }

        if (
            typeof unitCost !== "number" ||
            unitCost < 0
        ) {
            throw new Error(
                "Valid unit cost is required"
            );
        }


        // ==================================================
        // TRANSACTION
        // ==================================================

        return await AppDataSource.manager.transaction(
            async (manager) => {

                // ==========================================
                // FIND ACTIVE INVENTORY
                // ==========================================

                const inventory =
                    await manager.findOne(
                        Inventory,
                        {
                            where: {
                                inventory_id:
                                    inventoryId,

                                is_active:
                                    true
                            }
                        }
                    );


                if (!inventory) {
                    throw new Error(
                        "Active inventory record not found"
                    );
                }


                // ==========================================
                // CHECK STOCK
                // ==========================================

                if (inventory.qty < qty) {
                    throw new Error(
                        `Insufficient stock. Available stock: ${inventory.qty}`
                    );
                }


                // ==========================================
                // CALCULATE LOSS
                // ==========================================

                const lossValue =
                    qty * unitCost;


                const now =
                    new Date();


                // ==========================================
                // UPDATE INVENTORY QUANTITY
                // ==========================================

                inventory.qty =
                    inventory.qty - qty;

                inventory.updated_at =
                    now;

                inventory.updated_by =
                    userId;


                // ==========================================
                // SAVE INVENTORY
                // ==========================================

                await manager.save(
                    Inventory,
                    inventory
                );


                // ==========================================
                // AUDIT INVENTORY UPDATE
                // ==========================================

                const inventoryAudit =
                    await createAuditRecordService(
                        manager,
                        {
                            tableName:
                                "transactions_inventory",

                            recordId:
                                inventory.inventory_id,

                            actionTypeCode:
                                "UPDATE",

                            userId:
                                userId,

                            storeId:
                                inventory.store_id,

                            sessionId:
                                sessionId
                        }
                    );


                // ==========================================
                // CREATE DAMAGE RECORD
                // ==========================================

                const damage =
                    manager.create(
                        DamagedGoods,
                        {
                            inventory_id:
                                inventory.inventory_id,

                            qty:
                                qty,

                            reason:
                                reason.trim(),

                            unit_cost:
                                unitCost,

                            loss_value:
                                lossValue,

                            is_active:
                                true,

                            created_at:
                                now,

                            created_by:
                                userId,

                            updated_at:
                                now,

                            updated_by:
                                userId
                        }
                    );


                // ==========================================
                // SAVE DAMAGE
                // ==========================================

                await manager.save(
                    DamagedGoods,
                    damage
                );


                // ==========================================
                // AUDIT DAMAGE INSERT
                // ==========================================

                const damageAudit =
                    await createAuditRecordService(
                        manager,
                        {
                            tableName:
                                "transactions_damaged_goods",

                            recordId:
                                damage.damage_id,

                            actionTypeCode:
                                "INSERT",

                            userId:
                                userId,

                            storeId:
                                inventory.store_id,

                            sessionId:
                                sessionId
                        }
                    );


                // ==========================================
                // RETURN
                // ==========================================

                return {
                    inventory,
                    damage,
                    audits: [
                        inventoryAudit,
                        damageAudit
                    ]
                };
            }
        );
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

export const updateDamagedGoodsService =
    async (
        damageId: number,
        qty: number,
        reason: string,
        unitCost: number,
        userId: number,
        sessionId: number
    ) => {

        validateId(
            damageId,
            "Invalid damage ID"
        );

        validateQuantity(qty);

        validateId(
            userId,
            "Valid user ID is required"
        );

        validateId(
            sessionId,
            "Valid session ID is required"
        );

        if (
            !reason ||
            reason.trim() === ""
        ) {
            throw new Error(
                "Damage reason is required"
            );
        }

        if (
            typeof unitCost !== "number" ||
            unitCost < 0
        ) {
            throw new Error(
                "Valid unit cost is required"
            );
        }


        return await AppDataSource.manager.transaction(
            async (manager) => {

                // ==========================================
                // FIND DAMAGE
                // ==========================================

                const damage =
                    await manager.findOne(
                        DamagedGoods,
                        {
                            where: {
                                damage_id:
                                    damageId,

                                is_active:
                                    true
                            }
                        }
                    );


                if (!damage) {
                    throw new Error(
                        "Active damaged goods record not found"
                    );
                }


                // ==========================================
                // FIND INVENTORY
                // ==========================================

                const inventory =
                    await manager.findOne(
                        Inventory,
                        {
                            where: {
                                inventory_id:
                                    damage.inventory_id,

                                is_active:
                                    true
                            }
                        }
                    );


                if (!inventory) {
                    throw new Error(
                        "Active inventory record not found"
                    );
                }


                // ==========================================
                // CALCULATE QUANTITY DIFFERENCE
                // ==========================================

                const quantityDifference =
                    qty - damage.qty;


                // ==========================================
                // CHECK STOCK IF INCREASING DAMAGE
                // ==========================================

                if (
                    quantityDifference > 0 &&
                    inventory.qty <
                        quantityDifference
                ) {
                    throw new Error(
                        `Insufficient stock. Available stock: ${inventory.qty}`
                    );
                }


                // ==========================================
                // UPDATE INVENTORY
                // ==========================================

                inventory.qty =
                    inventory.qty -
                    quantityDifference;


                const now =
                    new Date();


                inventory.updated_at =
                    now;

                inventory.updated_by =
                    userId;


                // ==========================================
                // SAVE INVENTORY
                // ==========================================

                await manager.save(
                    Inventory,
                    inventory
                );


                // ==========================================
                // AUDIT INVENTORY UPDATE
                // ==========================================

                const inventoryAudit =
                    await createAuditRecordService(
                        manager,
                        {
                            tableName:
                                "transactions_inventory",

                            recordId:
                                inventory.inventory_id,

                            actionTypeCode:
                                "UPDATE",

                            userId:
                                userId,

                            storeId:
                                inventory.store_id,

                            sessionId:
                                sessionId
                        }
                    );


                // ==========================================
                // UPDATE DAMAGE
                // ==========================================

                damage.qty =
                    qty;

                damage.reason =
                    reason.trim();

                damage.unit_cost =
                    unitCost;

                damage.loss_value =
                    qty * unitCost;

                damage.updated_at =
                    now;

                damage.updated_by =
                    userId;


                // ==========================================
                // SAVE DAMAGE
                // ==========================================

                await manager.save(
                    DamagedGoods,
                    damage
                );


                // ==========================================
                // AUDIT DAMAGE UPDATE
                // ==========================================

                const damageAudit =
                    await createAuditRecordService(
                        manager,
                        {
                            tableName:
                                "transactions_damaged_goods",

                            recordId:
                                damage.damage_id,

                            actionTypeCode:
                                "UPDATE",

                            userId:
                                userId,

                            storeId:
                                inventory.store_id,

                            sessionId:
                                sessionId
                        }
                    );


                // ==========================================
                // RETURN
                // ==========================================

                return {
                    inventory,
                    damage,
                    audits: [
                        inventoryAudit,
                        damageAudit
                    ]
                };
            }
        );
    };


// ======================================================
// DEACTIVATE DAMAGE RECORD
// ======================================================

export const deactivateDamagedGoodsService =
    async (
        damageId: number,
        userId: number,
        sessionId: number
    ) => {

        validateId(
            damageId,
            "Invalid damage ID"
        );

        validateId(
            userId,
            "Valid user ID is required"
        );

        validateId(
            sessionId,
            "Valid session ID is required"
        );


        return await AppDataSource.manager.transaction(
            async (manager) => {

                // ==========================================
                // FIND DAMAGE
                // ==========================================

                const damage =
                    await manager.findOne(
                        DamagedGoods,
                        {
                            where: {
                                damage_id:
                                    damageId,

                                is_active:
                                    true
                            }
                        }
                    );


                if (!damage) {
                    throw new Error(
                        "Active damaged goods record not found"
                    );
                }


                // ==========================================
                // FIND INVENTORY
                // ==========================================

                const inventory =
                    await manager.findOne(
                        Inventory,
                        {
                            where: {
                                inventory_id:
                                    damage.inventory_id,

                                is_active:
                                    true
                            }
                        }
                    );


                if (!inventory) {
                    throw new Error(
                        "Active inventory record not found"
                    );
                }


                // ==========================================
                // RESTORE DAMAGED QUANTITY
                // ==========================================

                inventory.qty =
                    inventory.qty +
                    damage.qty;


                const now =
                    new Date();


                inventory.updated_at =
                    now;

                inventory.updated_by =
                    userId;


                // ==========================================
                // SAVE INVENTORY
                // ==========================================

                await manager.save(
                    Inventory,
                    inventory
                );


                // ==========================================
                // AUDIT INVENTORY UPDATE
                // ==========================================

                const inventoryAudit =
                    await createAuditRecordService(
                        manager,
                        {
                            tableName:
                                "transactions_inventory",

                            recordId:
                                inventory.inventory_id,

                            actionTypeCode:
                                "UPDATE",

                            userId:
                                userId,

                            storeId:
                                inventory.store_id,

                            sessionId:
                                sessionId
                        }
                    );


                // ==========================================
                // DEACTIVATE DAMAGE
                // ==========================================

                damage.is_active =
                    false;

                damage.updated_at =
                    now;

                damage.updated_by =
                    userId;


                // ==========================================
                // SAVE DAMAGE
                // ==========================================

                await manager.save(
                    DamagedGoods,
                    damage
                );


                // ==========================================
                // AUDIT DAMAGE DELETE
                // ==========================================

                const damageAudit =
                    await createAuditRecordService(
                        manager,
                        {
                            tableName:
                                "transactions_damaged_goods",

                            recordId:
                                damage.damage_id,

                            actionTypeCode:
                                "DELETE",

                            userId:
                                userId,

                            storeId:
                                inventory.store_id,

                            sessionId:
                                sessionId
                        }
                    );


                // ==========================================
                // RETURN
                // ==========================================

                return {
                    inventory,
                    damage,
                    audits: [
                        inventoryAudit,
                        damageAudit
                    ]
                };
            }
        );
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
