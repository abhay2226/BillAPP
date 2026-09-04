
import { AppDataSource } from "../datasource.js";

import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";
import { ReferenceType } from "../entity/MasterReference.js";
import { ActionType } from "../entity/MasterActionType.js";
import { Audit } from "../entity/TransactionsAudit.js";

import { EntityManager } from "typeorm";


// ======================================================
// STOCK MOVEMENT DATA
// ======================================================

export type StockMovementData = {
    inventoryId: number;
    movementTypeId: number;
    quantityChange: number;
    referenceTypeCode: string;
    referenceId: number;
    userId: number;
    sessionId: number;
};


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
// GET REFERENCE TYPE BY CODE
// ======================================================

const getReferenceType = async (
    manager: EntityManager,
    code: string
): Promise<ReferenceType> => {

    const referenceType =
        await manager.findOne(
            ReferenceType,
            {
                where: {
                    code,
                    is_active: true
                }
            }
        );

    if (!referenceType) {
        throw new Error(
            `Reference type '${code}' not found or inactive`
        );
    }

    return referenceType;
};


// ======================================================
// GET ACTION TYPE BY CODE
// ======================================================

const getActionType = async (
    manager: EntityManager,
    code: string
): Promise<ActionType> => {

    const actionType =
        await manager.findOne(
            ActionType,
            {
                where: {
                    code,
                    is_active: true
                }
            }
        );

    if (!actionType) {
        throw new Error(
            `Action type '${code}' not found or inactive`
        );
    }

    return actionType;
};


// ======================================================
// CREATE AUDIT RECORD
// ======================================================

const createAuditRecord = async (
    manager: EntityManager,
    data: {
        tableName: string;
        recordId: number;
        actionTypeCode: string;
        userId: number;
        storeId: number;
        sessionId: number;
        ipAddress?: string | null;
    }
): Promise<Audit> => {

    // ==================================================
    // GET ACTION TYPE
    // ==================================================

    const actionType =
        await getActionType(
            manager,
            data.actionTypeCode.trim().toUpperCase()
        );


    // ==================================================
    // CREATE AUDIT
    // ==================================================

    const audit =
        manager.create(
            Audit,
            {
                table_name:
                    data.tableName,

                record_id:
                    data.recordId,

                action_type_id:
                    actionType.action_type_id,

                action_type:
                    actionType,

                updated_by:
                    data.userId,

                updated_at:
                    new Date(),

                store_id:
                    data.storeId,

                session_id:
                    data.sessionId,

                ip_address:
                    data.ipAddress ?? null,

                is_active:
                    true
            }
        );


    return await manager.save(
        Audit,
        audit
    );
};



// ======================================================
// VALIDATE STOCK MOVEMENT
// ======================================================

const validateStockMovement = (
    data: StockMovementData
): void => {

    validateId(
        data.inventoryId,
        "Valid inventory ID is required"
    );


    validateId(
        data.movementTypeId,
        "Valid movement type ID is required"
    );


    validateId(
        data.referenceId,
        "Valid reference ID is required"
    );


    validateId(
        data.userId,
        "Valid user ID is required"
    );


    validateId(
        data.sessionId,
        "Valid session ID is required"
    );


    if (
        !Number.isInteger(data.quantityChange) ||
        data.quantityChange === 0
    ) {
        throw new Error(
            "Quantity change must be a non-zero integer"
        );
    }


    if (
        !data.referenceTypeCode ||
        data.referenceTypeCode.trim() === ""
    ) {
        throw new Error(
            "Reference type code is required"
        );
    }
};


// ======================================================
// CREATE STOCK MOVEMENT
// ======================================================

export const createStockMovementService = async (
    data: StockMovementData
) => {

    validateStockMovement(data);


    return await AppDataSource.manager.transaction(
        async (manager) => {

            // ==============================================
            // FIND INVENTORY
            // ==============================================

            const inventory =
                await manager.findOne(
                    Inventory,
                    {
                        where: {
                            inventory_id:
                                data.inventoryId,

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


            // ==============================================
            // GET REFERENCE TYPE
            // ==============================================

            const referenceType =
                await getReferenceType(
                    manager,
                    data.referenceTypeCode
                        .trim()
                );


            // ==============================================
            // CALCULATE NEW QUANTITY
            // ==============================================

            const newQuantity =
                inventory.qty +
                data.quantityChange;


            if (newQuantity < 0) {
                throw new Error(
                    `Insufficient stock. Available stock: ${inventory.qty}`
                );
            }


            const now = new Date();


            // ==============================================
            // UPDATE INVENTORY
            // ==============================================

            inventory.qty =
                newQuantity;

            inventory.updated_at =
                now;

            inventory.updated_by =
                data.userId;


            await manager.save(
                Inventory,
                inventory
            );

            const inAudit =
                await createAuditRecord(
                    manager,
                    {
                        tableName:
                            "transactions_inventory",

                        recordId:
                            inventory.inventory_id,

                        actionTypeCode:
                            "INSERT",

                        userId:
                            data.userId,

                        storeId:
                            inventory.store_id,

                        sessionId:
                            data.sessionId
                    }
                );

            await manager.save(
                Audit,
                inAudit
            );



            // ==============================================
            // CREATE STOCK MOVEMENT
            // ==============================================

            const movement =
                manager.create(
                    StockMovement,
                    {
                        inventory_id:
                            inventory.inventory_id,

                        movement_type_id:
                            data.movementTypeId,

                        quantity_change:
                            data.quantityChange,

                        reference_type_id:
                            referenceType.reference_type_id,

                        referenceType:
                            referenceType,

                        reference_id:
                            data.referenceId,

                        is_active:
                            true,

                        created_at:
                            now,

                        created_by:
                            data.userId,

                        updated_at:
                            now,

                        updated_by:
                            data.userId
                    }
                );


            await manager.save(
                StockMovement,
                movement
            );


            // ==============================================
            // AUDIT STOCK MOVEMENT
            // ==============================================

            const audit =
                await createAuditRecord(
                    manager,
                    {
                        tableName:
                            "transactions_stock_movement",

                        recordId:
                            movement.movement_id,

                        actionTypeCode:
                            "INSERT",

                        userId:
                            data.userId,

                        storeId:
                            inventory.store_id,

                        sessionId:
                            data.sessionId
                    }
                );
            
             await manager.save(
                Audit,
                audit
            );


            // ==============================================
            // RETURN RESULT
            // ==============================================

            return {
                inventory,
                movement,
                audit
            };
        }
    );
};


// ======================================================
// STOCK IN
// ======================================================

export const stockInService = async (
    inventoryId: number,
    movementTypeId: number,
    quantity: number,
    userId: number,
    sessionId: number,
    referenceTypeCode: string,
    referenceId: number
) => {

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        throw new Error(
            "Stock-in quantity must be a positive integer"
        );
    }


    return await createStockMovementService({

        inventoryId,

        movementTypeId,

        quantityChange:
            quantity,

        userId,

        sessionId,

        referenceTypeCode,

        referenceId
    });
};


// ======================================================
// STOCK OUT
// ======================================================

export const stockOutService = async (
    inventoryId: number,
    movementTypeId: number,
    quantity: number,
    userId: number,
    sessionId: number,
    referenceTypeCode: string,
    referenceId: number
) => {

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        throw new Error(
            "Stock-out quantity must be a positive integer"
        );
    }


    return await createStockMovementService({

        inventoryId,

        movementTypeId,

        quantityChange:
            -quantity,

        userId,

        sessionId,

        referenceTypeCode,

        referenceId
    });
};


// ======================================================
// GET STOCK MOVEMENT BY ID
// ======================================================

export const getStockMovementByIdService = async (
    movementId: number
) => {

    validateId(
        movementId,
        "Invalid movement ID"
    );


    const repository =
        AppDataSource.getRepository(
            StockMovement
        );


    return await repository.findOne({

        where: {
            movement_id:
                movementId
        },

        relations: [
            "inventory",
            "movementType",
            "referenceType"
        ]
    });
};


// ======================================================
// GET ALL ACTIVE STOCK MOVEMENTS
// ======================================================

export const getAllStockMovementsService =
    async () => {

        const repository =
            AppDataSource.getRepository(
                StockMovement
            );


        return await repository.find({

            where: {
                is_active: true
            },

            relations: [
                "inventory",
                "movementType",
                "referenceType"
            ],

            order: {
                created_at: "DESC"
            }
        });
    };


// ======================================================
// GET ALL STOCK MOVEMENT HISTORY
// ======================================================

export const getAllStockMovementHistoryService =
    async () => {

        const repository =
            AppDataSource.getRepository(
                StockMovement
            );


        return await repository.find({

            relations: [
                "inventory",
                "movementType",
                "referenceType"
            ],

            order: {
                created_at: "DESC"
            }
        });
    };


// ======================================================
// GET INVENTORY MOVEMENT HISTORY
// ======================================================

export const getInventoryMovementHistoryService =
    async (
        inventoryId: number
    ) => {

        validateId(
            inventoryId,
            "Invalid inventory ID"
        );


        const repository =
            AppDataSource.getRepository(
                StockMovement
            );


        return await repository.find({

            where: {
                inventory_id:
                    inventoryId,

                is_active:
                    true
            },

            relations: [
                "movementType",
                "referenceType"
            ],

            order: {
                created_at: "DESC"
            }
        });
    };


// ======================================================
// GET MOVEMENTS BY TYPE
// ======================================================

export const getMovementsByTypeService =
    async (
        movementTypeId: number
    ) => {

        validateId(
            movementTypeId,
            "Invalid movement type ID"
        );


        const repository =
            AppDataSource.getRepository(
                StockMovement
            );


        return await repository.find({

            where: {
                movement_type_id:
                    movementTypeId,

                is_active:
                    true
            },

            relations: [
                "inventory",
                "movementType",
                "referenceType"
            ],

            order: {
                created_at: "DESC"
            }
        });
    };


// ======================================================
// GET MOVEMENTS BY REFERENCE
// ======================================================

export const getMovementsByReferenceService =
    async (
        referenceTypeCode: string,
        referenceId: number
    ) => {

        if (
            !referenceTypeCode ||
            referenceTypeCode.trim() === ""
        ) {
            throw new Error(
                "Invalid reference type code"
            );
        }


        validateId(
            referenceId,
            "Invalid reference ID"
        );


        const repository =
            AppDataSource.getRepository(
                StockMovement
            );


        return await repository
            .createQueryBuilder("movement")

            .leftJoinAndSelect(
                "movement.referenceType",
                "referenceType"
            )

            .leftJoinAndSelect(
                "movement.inventory",
                "inventory"
            )

            .leftJoinAndSelect(
                "movement.movementType",
                "movementType"
            )

            .where(
                "referenceType.code = :code",
                {
                    code:
                        referenceTypeCode.trim()
                }
            )

            .andWhere(
                "movement.reference_id = :referenceId",
                {
                    referenceId
                }
            )

            .andWhere(
                "movement.is_active = :isActive",
                {
                    isActive: true
                }
            )

            .orderBy(
                "movement.created_at",
                "DESC"
            )

            .getMany();
    };


// ======================================================
// GET MOVEMENTS BY DATE RANGE
// ======================================================

export const getMovementsByDateRangeService =
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


        const repository =
            AppDataSource.getRepository(
                StockMovement
            );


        return await repository
            .createQueryBuilder("movement")

            .leftJoinAndSelect(
                "movement.inventory",
                "inventory"
            )

            .leftJoinAndSelect(
                "movement.movementType",
                "movementType"
            )

            .leftJoinAndSelect(
                "movement.referenceType",
                "referenceType"
            )

            .where(
                "movement.created_at BETWEEN :fromDate AND :toDate",
                {
                    fromDate,
                    toDate
                }
            )

            .andWhere(
                "movement.is_active = :isActive",
                {
                    isActive: true
                }
            )

            .orderBy(
                "movement.created_at",
                "DESC"
            )

            .getMany();
    };


// ======================================================
// GET INVENTORY MOVEMENTS BY DATE RANGE
// ======================================================

export const getInventoryMovementsByDateRangeService =
    async (
        inventoryId: number,
        fromDate: Date,
        toDate: Date
    ) => {

        validateId(
            inventoryId,
            "Invalid inventory ID"
        );


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


        const repository =
            AppDataSource.getRepository(
                StockMovement
            );


        return await repository
            .createQueryBuilder("movement")

            .leftJoinAndSelect(
                "movement.referenceType",
                "referenceType"
            )

            .leftJoinAndSelect(
                "movement.movementType",
                "movementType"
            )

            .where(
                "movement.inventory_id = :inventoryId",
                {
                    inventoryId
                }
            )

            .andWhere(
                "movement.created_at BETWEEN :fromDate AND :toDate",
                {
                    fromDate,
                    toDate
                }
            )

            .andWhere(
                "movement.is_active = :isActive",
                {
                    isActive: true
                }
            )

            .orderBy(
                "movement.created_at",
                "DESC"
            )

            .getMany();
    };


// ======================================================
// DELETE / DEACTIVATE STOCK MOVEMENT
// ======================================================

export const deleteStockMovementService =
    async (
        movementId: number,
        userId: number,
        sessionId: number
    ) => {

        validateId(
            movementId,
            "Invalid movement ID"
        );


        validateId(
            userId,
            "Invalid user ID"
        );


        validateId(
            sessionId,
            "Invalid session ID"
        );


        return await AppDataSource.manager.transaction(
            async (manager) => {

                // ==========================================
                // FIND MOVEMENT
                // ==========================================

                const movement =
                    await manager.findOne(
                        StockMovement,
                        {
                            where: {
                                movement_id:
                                    movementId,

                                is_active:
                                    true
                            }
                        }
                    );


                if (!movement) {
                    throw new Error(
                        "Active stock movement not found"
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
                                    movement.inventory_id,

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
                // REVERSE QUANTITY
                // ==========================================

                const newQuantity =
                    inventory.qty -
                    movement.quantity_change;


                if (newQuantity < 0) {
                    throw new Error(
                        "Cannot reverse movement because stock would become negative"
                    );
                }


                const now = new Date();


                // ==========================================
                // UPDATE INVENTORY
                // ==========================================

                inventory.qty =
                    newQuantity;

                inventory.updated_at =
                    now;

                inventory.updated_by =
                    userId;


                // ==========================================
                // DEACTIVATE MOVEMENT
                // ==========================================

                movement.is_active =
                    false;

                movement.updated_at =
                    now;

                movement.updated_by =
                    userId;


                // ==========================================
                // SAVE INVENTORY
                // ==========================================

                await manager.save(
                    Inventory,
                    inventory
                );


                // ==========================================
                // SAVE MOVEMENT
                // ==========================================

                await manager.save(
                    StockMovement,
                    movement
                );


                // ==========================================
                // CREATE DELETE AUDIT
                // ==========================================

                const audit =
                    await createAuditRecord(
                        manager,
                        {
                            tableName:
                                "transactions_stock_movement",

                            recordId:
                                movement.movement_id,

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
                // RETURN RESULT
                // ==========================================

                return {
                    inventory,
                    movement,
                    audit
                };
            }
        );
    };


// ======================================================
// GET CURRENT STOCK
// ======================================================

export const getCurrentStockService =
    async (
        inventoryId: number
    ) => {

        validateId(
            inventoryId,
            "Invalid inventory ID"
        );


        const repository =
            AppDataSource.getRepository(
                Inventory
            );


        const inventory =
            await repository.findOne({
                where: {
                    inventory_id:
                        inventoryId,

                    is_active:
                        true
                }
            });


        if (!inventory) {
            return null;
        }


        return {

            inventory_id:
                inventory.inventory_id,

            product_id:
                inventory.product_id,

            store_id:
                inventory.store_id,

            quantity:
                inventory.qty
        };
    };

