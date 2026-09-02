import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";

const inventoryRepository = AppDataSource.getRepository(Inventory);

export const createInventoryService = async (
    inventoryData: Partial<Inventory>
) => {
    const storeId = inventoryData.store_id;
    const productId = inventoryData.product_id;

    if (storeId === undefined || productId === undefined) {
        throw new Error("store_id and product_id are required");
    }

    const existingInventory = await inventoryRepository.findOne({
        where: {
            store_id: storeId,
            product_id: productId
        }
    });

    if (existingInventory) {
        throw new Error(
            "Inventory already exists for this product in this store"
        );
    }

    const inventory = inventoryRepository.create({
        ...inventoryData,
        store_id: storeId,
        product_id: productId,
        is_active: true,
        created_at: new Date()
    });

    return await inventoryRepository.save(inventory);
};

export const getInventoryByStoreService = async (
    storeId: number,
    productId?: number,
    productName?: string
) => {
    const query = inventoryRepository
        .createQueryBuilder("inventory")
        .leftJoinAndSelect("inventory.product", "product")
        .leftJoinAndSelect("product.type", "type")
        .leftJoinAndSelect("product.brand", "brand")
        .leftJoinAndSelect("product.uom", "uom")
        .leftJoinAndSelect("inventory.store", "store")
        .where("inventory.store_id = :storeId", {
            storeId
        })
        .andWhere("inventory.is_active = :isActive", {
            isActive: true
        });

    if (productId !== undefined) {
        query.andWhere(
            "inventory.product_id = :productId",
            {
                productId
            }
        );
    }

    if (
        productName !== undefined &&
        productName.trim() !== ""
    ) {
        query.andWhere(
            "LOWER(product.product_name) LIKE LOWER(:productName)",
            {
                productName: `%${productName.trim()}%`
            }
        );
    }

    return await query
        .orderBy("inventory.inventory_id", "ASC")
        .getMany();
};

export const getInventoryByIdService = async (
    inventoryId: number
) => {
    return await inventoryRepository.findOne({
        where: {
            inventory_id: inventoryId,
            is_active: true
        },
        relations: [
            "product",
            "product.type",
            "product.brand",
            "product.uom",
            "store"
        ]
    });
};

export const updatePricingService = async (
    inventoryId: number,
    costPrice: number | null,
    sellingPrice: number,
    userId: number
) => {
    const inventory = await inventoryRepository.findOne({
        where: {
            inventory_id: inventoryId,
            is_active: true
        }
    });

    if (!inventory) {
        return null;
    }

    inventory.cost_price = costPrice;
    inventory.selling_price = sellingPrice;
    inventory.updated_by = userId;
    inventory.updated_at = new Date();

    return await inventoryRepository.save(inventory);
};

export const updateInventoryQuantityService = async (
    inventoryId: number,
    quantity: number,
    userId: number
) => {
    const inventory = await inventoryRepository.findOne({
        where: {
            inventory_id: inventoryId,
            is_active: true
        }
    });

    if (!inventory) {
        return null;
    }

    inventory.qty = quantity;
    inventory.updated_by = userId;
    inventory.updated_at = new Date();

    return await inventoryRepository.save(inventory);
};

export const deactivateInventoryService = async (
    inventoryId: number,
    userId: number
) => {
    const inventory = await inventoryRepository.findOne({
        where: {
            inventory_id: inventoryId,
            is_active: true
        }
    });

    if (!inventory) {
        return null;
    }

    inventory.is_active = false;
    inventory.updated_by = userId;
    inventory.updated_at = new Date();

    return await inventoryRepository.save(inventory);
};