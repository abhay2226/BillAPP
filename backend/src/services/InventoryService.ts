import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";

const inventoryRepository = AppDataSource.getRepository(Inventory);

export const createInventoryService = async (inventoryData: Partial<Inventory>) => {
    const inventory = inventoryRepository.create(inventoryData);
    return await inventoryRepository.save(inventory);
};

export const getInventoryByStoreService = async (storeId: number, productId?: number) => {
    return await inventoryRepository.find({
        where: productId
            ? { store_id: storeId, product_id: productId, is_active: true }
            : { store_id: storeId, is_active: true },
        relations: ["product", "product.type", "product.brand", "product.uom"]
    });
};

export const updatePricingService = async (inventoryId: number, costPrice: number, sellingPrice: number, userId: number) => {
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
