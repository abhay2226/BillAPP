import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";

type StockMovementData = {
    inventoryId: number;
    movementTypeId: number;
    quantityChange: number;
    referenceType?: string;
    referenceId?: number;
    userId: number;
};

export const updateStockService = async (
    data: StockMovementData
) => {
    return await AppDataSource.manager.transaction(
        async (transactionManager) => {
            const stock = await transactionManager.findOne(
                Inventory,
                {
                    where: {
                        inventory_id: data.inventoryId,
                        is_active: true
                    }
                }
            );

            if (!stock) {
                return null;
            }

            const now = new Date();

            stock.qty += data.quantityChange;
            stock.updated_at = now;
            stock.updated_by = data.userId;

            await transactionManager.save(stock);

            const logData = {
                inventory_id: data.inventoryId,
                movement_type_id: data.movementTypeId,
                quantity_change: data.quantityChange,
                reference_type:
                    data.referenceType ?? null,
                reference_id:
                    data.referenceId ?? null,
                is_active: true,
                created_at: now,
                created_by: data.userId,
                updated_at: now,
                updated_by: data.userId
            };

            const log = transactionManager.create(
                StockMovement,
                logData
            );

            await transactionManager.save(log);

            return stock;
        }
    );
};

export const createStockMovementService = async (
    data: StockMovementData
) => {
    return await updateStockService(data);
};

export const deleteStockMovementService = async (
    movementId: number,
    userId: number
) => {
    return await AppDataSource.manager.transaction(
        async (transactionManager) => {
            const movement =
                await transactionManager.findOne(
                    StockMovement,
                    {
                        where: {
                            movement_id: movementId,
                            is_active: true
                        }
                    }
                );

            if (!movement) {
                return null;
            }

            const stock =
                await transactionManager.findOne(
                    Inventory,
                    {
                        where: {
                            inventory_id:
                                movement.inventory_id,
                            is_active: true
                        }
                    }
                );

            if (!stock) {
                return null;
            }

            const now = new Date();

            // Reverse the original movement.
            stock.qty -= movement.quantity_change;
            stock.updated_at = now;
            stock.updated_by = userId;

            // Soft-delete the movement record.
            movement.is_active = false;
            movement.updated_at = now;
            movement.updated_by = userId;

            await transactionManager.save(stock);
            await transactionManager.save(movement);

            return movement;
        }
    );
};