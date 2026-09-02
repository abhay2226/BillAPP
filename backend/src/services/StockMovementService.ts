import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";

export const updateStockService = async (data: {
    inventoryId: number;
    movementTypeId: number;
    quantityChange: number;
    referenceType?: string;
    referenceId?: number;
    userId: number;
}) => {
    return await AppDataSource.manager.transaction(async (transactionManager) => {
        const stock = await transactionManager.findOne(Inventory, {
            where: { inventory_id: data.inventoryId }
        });

        if (!stock) return null;

        stock.qty += data.quantityChange;
        stock.updated_by = data.userId;
        stock.updated_at = new Date();
        await transactionManager.save(stock);

        const log = transactionManager.create(StockMovement, {
            inventory_id: data.inventoryId,
            movement_type_id: data.movementTypeId,
            quantity_change: data.quantityChange,
            reference_type: data.referenceType ?? null,
            reference_id: data.referenceId ?? null,
            created_by: data.userId,
            created_at: new Date()
        });

        await transactionManager.save(log);

        return stock;
    });
};
