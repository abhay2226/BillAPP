import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";

const inventoryRepository = AppDataSource.getRepository(Inventory);

export const createInventoryService = async (inventoryData: Partial<Inventory>) => {
    const inventory = inventoryRepository.create(inventoryData);
    return await inventoryRepository.save(inventory);
};

export const getInventoryByStoreService = async (storeId: number, productId?: number) => {
    return await inventoryRepository.find({
        where: whereCondition,
        relations: [
            "product",
            "product.type",
            "product.brand",
            "product.uom",
            "store"
        ],
        order: {
            inventory_id: "ASC"
        }
    });
};

export const updatePricingService = async (inventoryId: number, costPrice: number, sellingPrice: number, userId: number) => {
    const inventory = await inventoryRepository.findOne({
        where: {
            inventory_id: inventoryId,
            is_active: true
        }
    });
    
    if (!inventory) return null;

    inventory.cost_price = costPrice;
    inventory.selling_price = sellingPrice;
    inventory.updated_by = userId;
    inventory.updated_at = new Date();

    return await inventoryRepository.save(inventory);
};
