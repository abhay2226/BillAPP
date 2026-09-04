import { AppDataSource } from "../datasource.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";
import { ReferenceType } from "../entity/MasterReference.js";

const inventoryRepository = AppDataSource.getRepository(Inventory);

export type InventoryData = Partial<Inventory> & {
    movement_type_id?: number;
    reference_type_code?: string;
    reference_id?: number;
};

// Helper function to dynamically resolve reference_type_id from MasterReference code
const getReferenceTypeId = async (
    transactionalEntityManager: any,
    code: string
): Promise<number> => {
    const refType = await transactionalEntityManager.findOne(ReferenceType, {
        where: { code, is_active: true }
    });
    if (!refType) {
        throw new Error(`Reference type with code '${code}' not found or inactive.`);
    }
    return refType.reference_type_id;
};

export const createInventoryService = async (
    inventoryData: InventoryData
) => {
    const storeId = inventoryData.store_id;
    const productId = inventoryData.product_id;
    const quantity = inventoryData.qty ?? 0;
    const userId = inventoryData.created_by;

    if (
        storeId === undefined ||
        !Number.isInteger(storeId) ||
        storeId <= 0
    ) {
        throw new Error("Valid store ID is required");
    }

    if (
        productId === undefined ||
        !Number.isInteger(productId) ||
        productId <= 0
    ) {
        throw new Error("Valid product ID is required");
    }

    if (
        !Number.isInteger(quantity) ||
        quantity < 0
    ) {
        throw new Error("Quantity must be a non-negative integer");
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const inventoryRepo = queryRunner.manager.getRepository(Inventory);
        const stockMovementRepo = queryRunner.manager.getRepository(StockMovement);

        // Fetch existing inventory record using pessimistic write lock
        let inventory = await inventoryRepo.findOne({
            where: {
                store_id: storeId,
                product_id: productId
            },
            lock: { mode: "pessimistic_write" }
        });

        const now = new Date();

        if (!inventory) {
            // New inventory item code: "INVADD"
            const refTypeId = await getReferenceTypeId(queryRunner.manager, "INVADD");

            inventory = inventoryRepo.create({
                ...inventoryData,
                store_id: storeId,
                product_id: productId,
                qty: quantity,
                is_active: true,
                created_at: now,
                created_by: userId
            });

            inventory = await inventoryRepo.save(inventory);

            if (quantity > 0) {
                if (inventoryData.movement_type_id === undefined) {
                    throw new Error("Movement type ID is required for stock creation");
                }

                const stockMovement = stockMovementRepo.create({
                    inventory_id: inventory.inventory_id,
                    movement_type_id: inventoryData.movement_type_id,
                    reference_type_id: refTypeId,
                    quantity_change: quantity,
                    reference_type: "INVENTORY",
                    reference_id: inventoryData.reference_id ?? inventory.inventory_id,
                    is_active: true,
                    created_at: now,
                    created_by: userId,
                    updated_at: now,
                    updated_by: userId
                });

                await stockMovementRepo.save(stockMovement);
            }
        } else {
            // Updating existing inventory stock code: "INVED"
            const refTypeId = await getReferenceTypeId(queryRunner.manager, "INVED");

            if (!inventory.is_active) {
                inventory.is_active = true;
            }

            if (quantity > 0) {
                if (inventoryData.movement_type_id === undefined) {
                    throw new Error("Movement type ID is required for restock");
                }

                inventory.qty += quantity;
                inventory.updated_at = now;
                inventory.updated_by = userId ?? null;

                inventory = await inventoryRepo.save(inventory);

                const stockMovement = stockMovementRepo.create({
                    inventory_id: inventory.inventory_id,
                    movement_type_id: inventoryData.movement_type_id,
                    reference_type_id: refTypeId,
                    quantity_change: quantity,
                    reference_type: "INVENTORY",
                    reference_id: inventoryData.reference_id ?? inventory.inventory_id,
                    is_active: true,
                    created_at: now,
                    created_by: userId,
                    updated_at: now,
                    updated_by: userId
                });

                await stockMovementRepo.save(stockMovement);
            }
        }

        await queryRunner.commitTransaction();
        return inventory;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
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
        .where("inventory.store_id = :storeId", { storeId })
        .andWhere("inventory.is_active = :isActive", { isActive: true });

    if (productId !== undefined) {
        query.andWhere("inventory.product_id = :productId", { productId });
    }

    if (productName !== undefined && productName.trim() !== "") {
        query.andWhere(
            "LOWER(product.product_name) LIKE LOWER(:productName)",
            { productName: `%${productName.trim()}%` }
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

    if (
        costPrice !== null &&
        (!Number.isFinite(costPrice) || costPrice < 0)
    ) {
        throw new Error("Invalid cost price");
    }

    if (!Number.isFinite(sellingPrice) || sellingPrice < 0) {
        throw new Error("Invalid selling price");
    }

    inventory.cost_price = costPrice;
    inventory.selling_price = sellingPrice;
    inventory.updated_by = userId;
    inventory.updated_at = new Date();

    return await inventoryRepository.save(inventory);
};

export const updateInventoryQuantityService = async (
    inventoryId: number,
    quantityChange: number,
    movementTypeId: number,
    referenceTypeCode: string | undefined,
    referenceId: number | undefined,
    userId: number
) => {
    if (!Number.isInteger(quantityChange) || quantityChange === 0) {
        throw new Error("Quantity change must be a non-zero integer");
    }

    if (!Number.isInteger(movementTypeId) || movementTypeId <= 0) {
        throw new Error("Valid movement type ID is required");
    }

    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const inventoryRepo = queryRunner.manager.getRepository(Inventory);
        const stockMovementRepo = queryRunner.manager.getRepository(StockMovement);

        // Fall back to "ADJ" (Manual adjustment) if no code is provided
        const code = referenceTypeCode ?? "ADJ";
        const refTypeId = await getReferenceTypeId(queryRunner.manager, code);

        const inventory = await inventoryRepo.findOne({
            where: {
                inventory_id: inventoryId,
                is_active: true
            },
            lock: { mode: "pessimistic_write" }
        });

        if (!inventory) {
            throw new Error("Inventory not found");
        }

        const newQuantity = inventory.qty + quantityChange;

        if (newQuantity < 0) {
            throw new Error("Insufficient stock");
        }

        const now = new Date();

        inventory.qty = newQuantity;
        inventory.updated_by = userId;
        inventory.updated_at = now;

        const updatedInventory = await inventoryRepo.save(inventory);

        const stockMovement = stockMovementRepo.create({
            inventory_id: inventoryId,
            movement_type_id: movementTypeId,
            reference_type_id: refTypeId,
            quantity_change: quantityChange,
            reference_type: "INVENTORY",
            reference_id: referenceId ?? inventoryId,
            is_active: true,
            created_at: now,
            created_by: userId,
            updated_at: now,
            updated_by: userId
        });

        await stockMovementRepo.save(stockMovement);

        await queryRunner.commitTransaction();

        return updatedInventory;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};

export const deactivateInventoryService = async (
    inventoryId: number,
    userId: number
) => {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const inventoryRepo = queryRunner.manager.getRepository(Inventory);

        const inventory = await inventoryRepo.findOne({
            where: {
                inventory_id: inventoryId,
                is_active: true
            },
            lock: { mode: "pessimistic_write" }
        });

        if (!inventory) {
            return null;
        }

        if (inventory.qty > 0) {
            throw new Error("Cannot delete inventory with available stock");
        }

        inventory.is_active = false;
        inventory.updated_by = userId;
        inventory.updated_at = new Date();

        const updatedInventory = await inventoryRepo.save(inventory);

        await queryRunner.commitTransaction();

        return updatedInventory;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};