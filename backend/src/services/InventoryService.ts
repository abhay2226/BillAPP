import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";
import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";

const inventoryRepository = AppDataSource.getRepository(Inventory);
const movementRepository = AppDataSource.getRepository(StockMovement);
const damagedGoodsRepository = AppDataSource.getRepository(DamagedGoods);

export const createInventoryService = async (
    inventoryData: Partial<Inventory>
) => {
    const inventory = inventoryRepository.create(inventoryData);
    return await inventoryRepository.save(inventory);
};

export const getInventoryByStoreService = async (
    storeId: number,
    productId?: number
) => {
    return await inventoryRepository.find({
        where: productId
            ? { store_id: storeId, product_id: productId, is_active: true }
            : { store_id: storeId, is_active: true },
        relations: ["product", "product.type", "product.brand", "product.uom"]
    });
};

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

        const log = movementRepository.create({
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


export const updatePricingService = async (
    inventoryId: number,
    costPrice: number,
    sellingPrice: number,
    userId: number
) => {
    const inventory = await inventoryRepository.findOne({
        where: { inventory_id: inventoryId }
    });

    if (!inventory) return null;

    inventory.cost_price = costPrice;
    inventory.selling_price = sellingPrice;
    inventory.updated_by = userId;
    inventory.updated_at = new Date();
    
    return await inventoryRepository.save(inventory);
};

export const logDamagedGoodsService = async (data: {
    inventoryId: number;
    qty: number;
    reason?: string;
    userId: number;
}) => {
    return await AppDataSource.manager.transaction(async (transactionManager) => {
        const stock = await transactionManager.findOne(Inventory, {
            where: { inventory_id: data.inventoryId }
        });

        if (!stock) return { status: "NOT_FOUND", data: null };
        if (stock.qty < data.qty) return { status: "INSUFFICIENT_STOCK", data: null };

        const unitCost = Number(stock.cost_price) || 0;
        const lossValue = data.qty * unitCost;

        const damageRecord = damagedGoodsRepository.create({
            inventory_id: data.inventoryId,
            qty: data.qty,
            reason: data.reason ?? null,
            unit_cost: unitCost,
            loss_value: lossValue,
            created_by: data.userId,
            created_at: new Date()
        });

        const savedDamage = await transactionManager.save(damageRecord);

        stock.qty -= data.qty;
        stock.updated_by = data.userId;
        stock.updated_at = new Date();
        await transactionManager.save(stock);

        const log = movementRepository.create({
            inventory_id: data.inventoryId,
            movement_type_id: 3,
            quantity_change: -data.qty,
            reference_type: "DAMAGED_GOODS",
            reference_id: savedDamage.damage_id,
            created_by: data.userId,
            created_at: new Date()
        });

        await transactionManager.save(log);

        return { status: "SUCCESS", data: savedDamage };
    });
};