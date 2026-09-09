import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";
import { Audit } from "../entity/TransactionsAudit.js";
import { ActionType } from "../entity/MasterActionType.js";
import { Product } from "../entity/TransactionsProduct.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";
import { Session } from "../entity/TransactionsSession.js";

import { isUniqueConstraintError } from "./Errors.js";
import { In, Not } from "typeorm";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError
} from "../utils/AppError.js";

// Helper: resolve ActionType id by code string (e.g. "UPDATE", "DELETE")
const getActionTypeId = async (
    manager: any,
    code: string
): Promise<number | null> => {
    try {
        const actionType = await manager.findOne(ActionType, {
            where: { code, is_active: true }
        });
        return actionType ? actionType.action_type_id : null;
    } catch {
        return null;
    }
};

const storeRepo = AppDataSource.getRepository(Store);
const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);

export interface StoreData {
    store_name: string;
    gst_no: string;
    location: string | null;
    is_active?: boolean;
}

//=========================================================================
// list stores and owners for signup
//=========================================================================
// export async function listStoresForSignup(search?: string) {
//     const stores = await storeRepo.find({
//         where: {
//             is_active: true
//         },
//         order: {
//             store_name: "ASC"
//         }
//     });

//     const searchTerm = search?.trim().toLowerCase();

// let filteredStores = stores;

// if (searchTerm) {
//     const ownerRole = await roleRepo.findOne({
//         where: {
//             role_name: "OWNER",
//             is_active: true
//         }
//     });

//     const storeIds = stores.map(store => store.store_id);

//     const owners = ownerRole
//         ? await userRepo.find({
//               where: {
//                   store_id: In(storeIds),
//                   role_id: ownerRole.role_id,
//                   is_active: true
//               }
//           })
//         : [];

//     const ownerByStoreIds = new Map(
//         owners.map(owner => [owner.store_id, owner])
//     );

//     filteredStores = stores.filter(store => {
//         const owner = ownerByStoreIds.get(store.store_id);

//         const ownerName = owner
//             ? `${owner.firstname}${owner.lastname ? ` ${owner.lastname}` : ""}`
//             : "";

//         return (
//             store.store_name.toLowerCase().includes(searchTerm) ||
//             (store.location ?? "").toLowerCase().includes(searchTerm) ||
//             ownerName.toLowerCase().includes(searchTerm)
//         );
//     });
// }

//     if (filteredStores.length === 0) {
//         return [];
//     }

//     const ownerRole = await roleRepo.findOne({
//         where: {
//             role_name: "OWNER",
//             is_active: true
//         }
//     });

//     const storeIds = filteredStores.map(store => store.store_id);

//     const owners = ownerRole
//         ? await userRepo.find({
//               where: {
//                   store_id: In(storeIds),
//                   role_id: ownerRole.role_id,
//                   is_active: true
//               }
//           })
//         : [];

//     const ownerByStoreIds = new Map(
//         owners.map(owner => [owner.store_id, owner])
//     );

//     return filteredStores.map(store => {
//         const owner = ownerByStoreIds.get(store.store_id);

//         return {
//             storeId: store.store_id,
//             storeName: store.store_name,
//             location: store.location,
//             ownerUserId: owner?.user_id ?? null,
//             ownerName: owner
//                 ? `${owner.firstname}${owner.lastname ? ` ${owner.lastname}` : ""}`
//                 : null
//         };
//     });
// }
export async function listStoresForSignup(search?: string) {
    const stores = await storeRepo.find({
        where: {
            is_active: true
        },
        order: {
            store_name: "ASC"
        }
    });

    if (stores.length === 0) {
        return [];
    }

    const ownerRole = await roleRepo.findOne({
        where: {
            role_name: "OWNER",
            is_active: true
        }
    });

    const storeIds = stores.map(store => store.store_id);

    const owners = ownerRole
        ? await userRepo.find({
              where: {
                  store_id: In(storeIds),
                  role_id: ownerRole.role_id,
                  is_active: true
              }
          })
        : [];

    const ownerByStoreIds = new Map(
        owners.map(owner => [owner.store_id, owner])
    );

    const searchTerm = search?.trim().toLowerCase();

    const filteredStores = searchTerm
        ? stores.filter(store => {
              const owner = ownerByStoreIds.get(store.store_id);

              const ownerName = owner
                  ? `${owner.firstname}${owner.lastname ? ` ${owner.lastname}` : ""}`
                  : "";

              return (
                  store.store_name.toLowerCase().includes(searchTerm) ||
                  (store.location ?? "").toLowerCase().includes(searchTerm) ||
                  ownerName.toLowerCase().includes(searchTerm)
              );
          })
        : stores;

    return filteredStores.map(store => {
        const owner = ownerByStoreIds.get(store.store_id);

        return {
            storeId: store.store_id,
            storeName: store.store_name,
            location: store.location,
            ownerUserId: owner?.user_id ?? null,
            ownerName: owner
                ? `${owner.firstname}${owner.lastname ? ` ${owner.lastname}` : ""}`
                : null
        };
    });
}

//=========================================================================
// list stores
//=========================================================================
export async function getStores() {
    return await storeRepo.find({
        where: { is_active: true },
        order: { store_id: "ASC" }
    });
}

//=========================================================================
// single store by id
//=========================================================================
export async function getStoreById(storeId: number) {
    const existingStore = await storeRepo.findOne({
        where: { store_id: storeId }
    });

    if (!existingStore) {
        throw new NotFoundError("Store not found.");
    }

    return existingStore;
}

//=========================================================================
// update store
//=========================================================================
export async function updateStore(
    storeId: number,
    data: Partial<StoreData>,
    userId: number,
    sessionId?: number
) {
    return AppDataSource.manager.transaction(async (manager) => {
        const stores = manager.getRepository(Store);
        const users = manager.getRepository(User);
        const roles = manager.getRepository(Role);
        const auditRepo = manager.getRepository(Audit);

        const existingStore = await stores.findOne({ where: { store_id: storeId, is_active: true } });
        if (!existingStore) {
            throw new NotFoundError("Store not found or is inactive.");
        }

        const actingUser = await users.findOne({ where: { user_id: userId, is_active: true } });
        if (!actingUser) {
            throw new NotFoundError("Acting user not found or inactive.");
        }

        const actingRole = await roles.findOne({ where: { role_id: actingUser.role_id } });
        const isOwner = actingRole?.role_name.toUpperCase() === "OWNER";
        if (!isOwner || actingUser.store_id !== storeId) {
            throw new ForbiddenError("Only this store's OWNER can update it.");
        }

        if (data.store_name !== undefined && data.store_name.trim() !== existingStore.store_name) {
            const duplicate = await stores.findOne({ where: { store_name: data.store_name.trim() } });
            if (duplicate) throw new ConflictError("A store with this name already exists.");
            existingStore.store_name = data.store_name.trim();
        }

        if (data.gst_no !== undefined && data.gst_no.trim() !== existingStore.gst_no) {
            const duplicate = await stores.findOne({ where: { gst_no: data.gst_no.trim() } });
            if (duplicate) throw new ConflictError("A store with this GST number already exists.");
            existingStore.gst_no = data.gst_no.trim();
        }

        if (data.location !== undefined) existingStore.location = data.location;
        if (data.is_active !== undefined) existingStore.is_active = data.is_active;

        existingStore.updated_at = new Date();
        existingStore.updated_by = userId;

        let savedStore: Store;
        try {
            savedStore = await stores.save(existingStore);
        } catch (err) {
            if (isUniqueConstraintError(err)) {
                throw new ConflictError("A store with that name or GST number already exists.");
            }
            throw err;
        }

        const updateActionTypeId = await getActionTypeId(manager, "UPDATE");
        if (updateActionTypeId && sessionId) {
            await auditRepo.insert({
                table_name: "transactions_store",
                record_id: savedStore.store_id,
                action_type_id: updateActionTypeId,
                store_id: savedStore.store_id,
                session_id: sessionId,
                ip_address: null,
                is_active: true,
            });
        }

        return savedStore;
    });
}

//=========================================================================
// close / deactivate store (with corrected cascade to DamagedGoods & StockMovement)
//=========================================================================
export async function closeStore(
    storeId: number,
    userId: number,
    sessionId?: number
) {
    return AppDataSource.manager.transaction(async (manager) => {
        const stores = manager.getRepository(Store);
        const users = manager.getRepository(User);
        const roles = manager.getRepository(Role);
        const auditRepo = manager.getRepository(Audit);

        const existingStore = await stores.findOne({ where: { store_id: storeId } });
        if (!existingStore) {
            throw new NotFoundError("Store not found.");
        }
        if (!existingStore.is_active) {
            throw new ConflictError("This store is already closed/inactive.");
        }

        const actingUser = await users.findOne({ where: { user_id: userId, is_active: true } });
        if (!actingUser) {
            throw new NotFoundError("Acting user not found or inactive.");
        }

        const actingRole = await roles.findOne({ where: { role_id: actingUser.role_id } });
        const isOwner = actingRole?.role_name.toUpperCase() === "OWNER";
        if (!isOwner || actingUser.store_id !== storeId) {
            throw new ForbiddenError("Only this store's OWNER can close it.");
        }

        const now = new Date();

        // 1. Deactivate the Store
        existingStore.is_active = false;
        existingStore.updated_at = now;
        existingStore.updated_by = userId;
        const savedStore = await stores.save(existingStore);

        // 2. Invalidate active sessions for other users in this store
        await manager.update(
            Session,
            { store_id: storeId, user_id: Not(userId), is_active: true },
            { is_active: false, status: "INACTIVE", logout_at: now }
        );

        // 3. Deactivate products
        await manager.update(
            Product,
            { store_id: storeId },
            { is_active: false, updated_at: now, updated_by: userId }
        );

        // 4. Deactivate inventory and get inventory IDs for relational child entities
        const storeInventories = await manager.find(Inventory, {
            select: { inventory_id: true },
            where: { store_id: storeId }
        });
        const inventoryIds = storeInventories.map(inv => inv.inventory_id);

        await manager.update(
            Inventory,
            { store_id: storeId },
            { is_active: false, updated_at: now, updated_by: userId }
        );

        // 5. Deactivate discounts
        await manager.update(
            Discount,
            { store_id: storeId },
            { is_active: false, updated_at: now, updated_by: userId }
        );

        // 6. Fix for DamagedGoods & StockMovement: filter by inventory_id: In(inventoryIds)
        if (inventoryIds.length > 0) {
            await manager.update(
                DamagedGoods,
                { inventory_id: In(inventoryIds) },
                { is_active: false }
            );

            await manager.update(
                StockMovement,
                { inventory_id: In(inventoryIds) },
                { is_active: false }
            );
        }

        const deleteActionTypeId = await getActionTypeId(manager, "DELETE");
        if (deleteActionTypeId && sessionId) {
            await auditRepo.insert({
                table_name: "transactions_store",
                record_id: savedStore.store_id,
                action_type_id: deleteActionTypeId,
                store_id: savedStore.store_id,
                session_id: sessionId,
                ip_address: null,
                is_active: true,
            });
        }

        return savedStore;
    });
}

// Alias deleteStore to closeStore for backwards compatibility
export const deleteStore = closeStore;

//=========================================================================
// restore store
//=========================================================================
export async function restoreStore(
    storeId: number,
    userId: number,
    sessionId?: number
) {
    return AppDataSource.manager.transaction(async (manager) => {
        const stores = manager.getRepository(Store);
        const users = manager.getRepository(User);
        const roles = manager.getRepository(Role);
        const auditRepo = manager.getRepository(Audit);

        const existingStore = await stores.findOne({ where: { store_id: storeId } });
        if (!existingStore) {
            throw new NotFoundError("Store not found.");
        }
        if (existingStore.is_active) {
            throw new ConflictError("This store is already active.");
        }

        const actingUser = await users.findOne({ where: { user_id: userId } });
        if (!actingUser) {
            throw new NotFoundError("Acting user not found.");
        }

        const ownerRole = await roles.findOne({ where: { role_name: "OWNER", is_active: true } });
        const isOwner = ownerRole ? actingUser.role_id === ownerRole.role_id : false;
        if (!isOwner || actingUser.store_id !== storeId) {
            throw new ForbiddenError("Only this store's OWNER can restore it.");
        }

        const now = new Date();

        // 1. Reactivate the Store
        existingStore.is_active = true;
        existingStore.updated_at = now;
        existingStore.updated_by = userId;
        const savedStore = await stores.save(existingStore);

        // 2. Reactivate owner account if inactive
        await manager.update(
            User,
            { store_id: storeId, role_id: ownerRole!.role_id },
            { is_active: true, updated_at: now, updated_by: userId }
        );

        // 3. Reactivate products
        await manager.update(
            Product,
            { store_id: storeId },
            { is_active: true, updated_at: now, updated_by: userId }
        );

        // 4. Reactivate inventories
        const storeInventories = await manager.find(Inventory, {
            select: { inventory_id: true },
            where: { store_id: storeId }
        });
        const inventoryIds = storeInventories.map(inv => inv.inventory_id);

        await manager.update(
            Inventory,
            { store_id: storeId },
            { is_active: true, updated_at: now, updated_by: userId }
        );

        // 5. Reactivate discounts
        await manager.update(
            Discount,
            { store_id: storeId },
            { is_active: true, updated_at: now, updated_by: userId }
        );

        // 6. Reactivate damaged goods and stock movements
        if (inventoryIds.length > 0) {
            await manager.update(
                DamagedGoods,
                { inventory_id: In(inventoryIds) },
                { is_active: true }
            );

            await manager.update(
                StockMovement,
                { inventory_id: In(inventoryIds) },
                { is_active: true }
            );
        }

        const updateActionTypeId = await getActionTypeId(manager, "UPDATE");
        if (updateActionTypeId && sessionId) {
            await auditRepo.insert({
                table_name: "transactions_store",
                record_id: savedStore.store_id,
                action_type_id: updateActionTypeId,
                store_id: savedStore.store_id,
                session_id: sessionId,
                ip_address: null,
                is_active: true,
            });
        }

        return savedStore;
    });
}
