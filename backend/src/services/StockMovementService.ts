import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";

export type StockMovementData = {
    inventoryId: number;
    movementTypeId: number;
    quantityChange: number;
    referenceTypeId?: number;
    referenceId?: number;
    userId: number;
};

const validateId = (
    value: number,
    message: string
): void => {
    if (!Number.isInteger(value) || value <= 0) {
        throw new Error(message);
    }
};

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
        data.userId,
        "Valid user ID is required"
    );

    if (
        !Number.isInteger(data.quantityChange) ||
        data.quantityChange === 0
    ) {
        throw new Error(
            "Quantity change must be a non-zero integer"
        );
    }

    if (data.referenceId !== undefined) {
        validateId(
            data.referenceId,
            "Invalid reference ID"
        );

        if (
            data.referenceType === undefined ||
            data.referenceType.trim() === ""
        ) {
            throw new Error(
                "Reference type is required when reference ID is provided"
            );
        }
    }

    if (
        data.referenceType !== undefined &&
        data.referenceType.trim() === ""
    ) {
        throw new Error(
            "Reference type cannot be empty"
        );
    }
};

export const createStockMovementService = async (
    data: StockMovementData
) => {
    validateStockMovement(data);

    return await AppDataSource.manager.transaction(
        async (manager) => {
            const inventory = await manager.findOne(
                Inventory,
                {
                    where: {
                        inventory_id: data.inventoryId,
                        is_active: true
                    }
                }
            );

            if (!inventory) {
                throw new Error(
                    "Active inventory record not found"
                );
            }

            const newQuantity =
                inventory.qty +
                data.quantityChange;

            if (newQuantity < 0) {
                throw new Error(
                    `Insufficient stock. Available stock: ${inventory.qty}`
                );
            }

            const now = new Date();

            inventory.qty = newQuantity;
            inventory.updated_at = now;
            inventory.updated_by = data.userId;

            await manager.save(
                Inventory,
                inventory
            );

            const movement = manager.create(
                StockMovement,
                {
                    inventory_id:
                        data.inventoryId,

                    movement_type_id:
                        data.movementTypeId,

                    quantity_change:
                        data.quantityChange,

                    reference_type:
                        data.referenceType ?? null,

                    reference_id:
                        data.referenceId ?? null,

                    is_active: true,

                    created_at: now,

                    created_by:
                        data.userId,

                    updated_at: now,

                    updated_by:
                        data.userId
                }
            );

            await manager.save(
                StockMovement,
                movement
            );

            return {
                inventory,
                movement
            };
        }
    );
};

export const stockInService = async (
    inventoryId: number,
    movementTypeId: number,
    quantity: number,
    userId: number,
    referenceType?: string,
    referenceId?: number
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
        quantityChange: quantity,
        userId,
        ...(referenceType !== undefined
            ? { referenceType }
            : {}),
        ...(referenceId !== undefined
            ? { referenceId }
            : {})
    });
};

export const stockOutService = async (
    inventoryId: number,
    movementTypeId: number,
    quantity: number,
    userId: number,
    referenceType?: string,
    referenceId?: number
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
        quantityChange: -quantity,
        userId,
        ...(referenceType !== undefined
            ? { referenceType }
            : {}),
        ...(referenceId !== undefined
            ? { referenceId }
            : {})
    });
};

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
            movement_id: movementId
        }
    });
};

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
            order: {
                created_at: "DESC"
            }
        });
    };

export const getAllStockMovementHistoryService =
    async () => {
        const repository =
            AppDataSource.getRepository(
                StockMovement
            );

        return await repository.find({
            order: {
                created_at: "DESC"
            }
        });
    };

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
                inventory_id: inventoryId,
                is_active: true
            },
            order: {
                created_at: "DESC"
            }
        });
    };

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
                is_active: true
            },
            order: {
                created_at: "DESC"
            }
        });
    };

export const getMovementsByReferenceService =
    async (
        referenceType: string,
        referenceId: number
    ) => {
        if (referenceType.trim() === "") {
            throw new Error("Invalid reference type");
        }

        validateId(
            referenceId,
            "Invalid reference ID"
        );

        const repository =
            AppDataSource.getRepository(
                StockMovement
            );

        return await repository.find({
            where: {
                reference_type:
                    referenceType.trim(),

                reference_id:
                    referenceId,

                is_active: true
            },
            order: {
                created_at: "DESC"
            }
        });
    };

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

export const deleteStockMovementService =
    async (
        movementId: number,
        userId: number
    ) => {
        validateId(
            movementId,
            "Invalid movement ID"
        );

        validateId(
            userId,
            "Invalid user ID"
        );

        return await AppDataSource.manager.transaction(
            async (manager) => {
                const movement =
                    await manager.findOne(
                        StockMovement,
                        {
                            where: {
                                movement_id:
                                    movementId,
                                is_active: true
                            }
                        }
                    );

                if (!movement) {
                    throw new Error(
                        "Active stock movement not found"
                    );
                }

                const inventory =
                    await manager.findOne(
                        Inventory,
                        {
                            where: {
                                inventory_id:
                                    movement.inventory_id,
                                is_active: true
                            }
                        }
                    );

                if (!inventory) {
                    throw new Error(
                        "Active inventory record not found"
                    );
                }

                const newQuantity =
                    inventory.qty -
                    movement.quantity_change;

                if (newQuantity < 0) {
                    throw new Error(
                        "Cannot reverse movement because stock would become negative"
                    );
                }

                const now = new Date();

                inventory.qty =
                    newQuantity;

                inventory.updated_at =
                    now;

                inventory.updated_by =
                    userId;

                movement.is_active =
                    false;

                movement.updated_at =
                    now;

                movement.updated_by =
                    userId;

                await manager.save(
                    Inventory,
                    inventory
                );

                await manager.save(
                    StockMovement,
                    movement
                );

                return {
                    inventory,
                    movement
                };
            }
        );
    };

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
                    is_active: true
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