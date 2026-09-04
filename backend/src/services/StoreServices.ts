import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";
import { Audit } from "../entity/TransactionsAudit.js";
import { ActionType } from "../entity/MasterActionType.js";

import { isUniqueConstraintError } from "./Error.js"

// import { AppError } from "../utils/AppError.js";
import { In, Not } from "typeorm";

// Helper: resolve ActionType id by code string (e.g. "UPDATE", "DELETE")
const getActionTypeId = async (
    manager: any,
    code: string
): Promise<number> => {
    const actionType = await manager.findOne(ActionType, {
        where: { code, is_active: true }
    });
    if (!actionType) {
        throw new Error(`Action type with code '${code}' not found or inactive.`);
    }
    return actionType.action_type_id;
};

const storeRepo = AppDataSource.getRepository(Store);
const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);

export interface StoreData{
    store_name: string;
    gst_no: string ;
    location: string | null;
    is_active?: boolean;
    // created_at: Date;
    // created_by: number | null;
    // updated_at: Date | null;
    // updated_by: number | null
}



//=========================================================================
//list stores and owners for signup
//=========================================================================
export async function listStoresForSignup(search?: string) {
    const stores = await storeRepo.find({
        where: {
            is_active: true
        },
        order: {
            store_name: "ASC"
        }
    });

    const searchTerm = search?.trim().toLowerCase();

    const filteredStores = searchTerm
        ? stores.filter(store =>
              store.store_name
                  .toLowerCase()
                  .includes(searchTerm) ||
              (store.location ?? "")
                  .toLowerCase()
                  .includes(searchTerm)
          )
        : stores;

    if (filteredStores.length === 0) {
        throw new Error("No matching active stores found.");
    }

    const ownerRole = await roleRepo.findOne({
        where: {
            role_name: "OWNER",
            is_active: true
        }
    });

    if (!ownerRole) {
        throw new Error("OWNER role does not exist.");
    }

    const storeIds = filteredStores.map(
        store => store.store_id
    );

    const owners = await userRepo.find({
        where: {
            store_id: In(storeIds),
            role_id: ownerRole.role_id,
            is_active: true
        }
    });

    const ownerByStoreIds = new Map(
        owners.map(owner => [
            owner.store_id,
            owner
        ])
    );

    return filteredStores.map(store => {
        const owner = ownerByStoreIds.get(store.store_id);

        return {
            storeId: store.store_id,
            storeName: store.store_name,
            location: store.location,
            ownerUserId: owner?.user_id ?? null,
            ownerName: owner
                ? `${owner.firstname}${
                      owner.lastname
                          ? ` ${owner.lastname}`
                          : ""
                  }`
                : null
        };
    });
}

//=========================================================================
//list sotre 
//=========================================================================
export async function getStores(){
    const existingStores = await storeRepo.find({
        where:{
            is_active: true
        },
        order:{
            store_id:"ASC"
        }
    })

    return existingStores;
}

//=========================================================================
//single store by id
//=========================================================================
export async function getStoreById(storeId: number){
    const existingStore = await storeRepo.findOne({ 
        where: { store_id: storeId }
        
    })

    if (!existingStore) {
         throw new Error("Store not found."); 
    }

    return existingStore;
}

//=========================================================================
//get store using searchterm
//=========================================================================
export async function getStoresOnsearch(search?: string) {
    const stores = await storeRepo.find({
        where: {
            is_active: true
        },
        order: {
            store_name: "ASC"
        }
    });

    const searchTerm = search?.trim().toLowerCase();

    if (!searchTerm) {
        return stores;
    }

    return stores.filter(store =>
        store.store_name.toLowerCase().includes(searchTerm) ||
        (store.location ?? "").toLowerCase().includes(searchTerm)
    );
}

//=========================================================================
//new store
//=========================================================================
// export async function createStore(data: StoreData){

//     const {
//         store_name,
//         gst_no,
//         location,
//         is_active = true
//      } = data

//     const existingStore = await storeRepo.findOne({ 
//         where: { 
//             store_name
//         }
        
//     })

//     if (existingStore) {
//          throw new Error("Store already exists."); 
//     }

//     const existingGst = await storeRepo.findOne({
//         where: {
//             gst_no
//         }
//     });

//     if (existingGst) {
//         throw new Error("A store with this GST number already exists.");
//     }

//     const newStore = await storeRepo.create({
//         store_name,
//         gst_no: data.gst_no,
//         location: data.location ?? null,
//         is_active,
//         created_at: new Date(),
//         created_by: null,
//         updated_at: null,
//         updated_by: null
//     })

//     const savedStore = await storeRepo.save(newStore); 
    
//     return savedStore; 
// }


//=========================================================================
//update store
//=========================================================================
// export async function updateStore(storeId: number, data:Partial<StoreData>,userId:number ){

//     // const {
//     //     store_name,
//     //     is_active= true
//     // } = data
//     const existingStore = await storeRepo.findOne({ 
//         where: { store_id: storeId , is_active:true}
        
//     })

//     if (!existingStore) {
//          throw new Error("Store not found."); 
//     }

//     const actingUser = await userRepo.findOne({ where: { user_id: userId } });
//     if (!actingUser || !actingUser.is_active) {
//       throw new Error("Acting user not found or inactive.");
//     }

//     const actingRole = await roleRepo.findOne({ where: { role_id: actingUser.role_id } });
//     const isOwner = actingRole?.role_name.toUpperCase() === "OWNER";
//     if (!isOwner || actingUser.store_id !== storeId) {
//       throw new Error("Only this store's OWNER can update it.");
//     }

//     if(data.store_name!== undefined && data.store_name!== existingStore.store_name){
//         const duplicate = await storeRepo.findOne({
//             where:{
//                 store_name: data.store_name
//             },
//         });
//         if (duplicate) { 
//         throw new Error("A Store with this name already exists."); 
//         }

//         existingStore.store_name=data.store_name;
//     }

//     if(data.gst_no !== undefined && data.gst_no !== existingStore.gst_no){
//         const duplicate = await storeRepo.findOne({
//             where:{
//                 gst_no: data.gst_no
//             },
//         });
//         if (duplicate) { 
//         throw new Error("A Store with this GST number already exists."); 
//         }

//         existingStore.gst_no=data.gst_no;
//     }
    


//     if (data.is_active !== undefined) { 
//         existingStore.is_active = data.is_active; 
//     }

//     if (data.gst_no !== undefined) {
//         existingStore.gst_no = data.gst_no;
//     }

//     if (data.location !== undefined) {
//         existingStore.location = data.location;
//     }

//     existingStore.updated_at = new Date();
//     existingStore.updated_by = userId;
    
//     const updatedStore = await storeRepo.save(existingStore); 
    
//     return updatedStore; 
// }
export async function updateStore(storeId: number, data: Partial<StoreData>, userId: number,sessionId: number) {
//     const {
//     store_name,
//      is_active= true
// } = data
  return AppDataSource.manager.transaction(async (manager) => {
    const stores = manager.getRepository(Store);
    const users = manager.getRepository(User);
    const roles = manager.getRepository(Role);
    const auditRepo = manager.getRepository(Audit);

    const existingStore = await stores.findOne({ where: { store_id: storeId, is_active: true } });
    if (!existingStore) {
      throw new Error("Store not found.");
    }

    const actingUser = await users.findOne({ where: { user_id: userId } });
    if (!actingUser || !actingUser.is_active) {
      throw new Error("Acting user not found or inactive.");
    }

    const actingRole = await roles.findOne({ where: { role_id: actingUser.role_id } });
    const isOwner = actingRole?.role_name.toUpperCase() === "OWNER";
    if (!isOwner || actingUser.store_id !== storeId) {
      throw new Error("Only this store's OWNER can update it.");
    }

    if (data.store_name !== undefined && data.store_name !== existingStore.store_name) {
      const duplicate = await stores.findOne({ where: { store_name: data.store_name } });
      if (duplicate) throw new Error("A Store with this name already exists.");
      existingStore.store_name = data.store_name;
    }

    if (data.gst_no !== undefined && data.gst_no !== existingStore.gst_no) {
      const duplicate = await stores.findOne({ where: { gst_no: data.gst_no } });
      if (duplicate) throw new Error("A Store with this GST number already exists.");
      existingStore.gst_no = data.gst_no;
    }

    if (data.location !== undefined) existingStore.location = data.location;
    if (data.is_active !== undefined) existingStore.is_active = data.is_active;

    existingStore.updated_at = new Date();
    existingStore.updated_by = userId;

    let savedStore;
    try {
      savedStore = await stores.save(existingStore);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new Error("A store with that name or GST number already exists.");
      }
      throw err;
    }

    const updateActionTypeId = await getActionTypeId(manager, "UPDATE");

    await auditRepo.insert({
      table_name: "transactions_store",
      record_id: savedStore.store_id,
      action_type_id: updateActionTypeId,
      store_id: savedStore.store_id,
      session_id: sessionId,
      ip_address: null,
      is_active: true,
    });

    return savedStore;
  });
}

//=========================================================================
//deactive store
//=========================================================================
// export async function deleteStore(storeId: number, userId:number){

//     const existingStore = await storeRepo.findOne({ 
//         where: { store_id: storeId }
        
//     })

//     if (!existingStore) {
//          throw new Error("Store not found."); 
//     }

//     //409
//     if (!existingStore.is_active) {
//          throw new Error("This store is already deactivated."); 
//     }

//     const actingUser = await userRepo.findOne({ where: { user_id: userId } });
//     if (!actingUser || !actingUser.is_active) {
//         throw new Error("Acting user not found or inactive.");
//     }

//     const actingRole = await roleRepo.findOne({ where: { role_id: actingUser.role_id } });
//     const isOwner = actingRole?.role_name.toUpperCase() === "OWNER";
//     if (!isOwner || actingUser.store_id !== storeId) {
//       throw new Error("Only this store's OWNER can deactivate it.");
//     }

//     const otherActiveUsers = await userRepo.count({
//       where: { store_id: storeId, is_active: true, user_id: Not(userId) },
//     });
//     if (otherActiveUsers > 0) {
//       throw new Error(`Cannot deactivate this store — ${otherActiveUsers} other active user(s) still attached. Reassign or deactivate them first.`);
//     }

//     existingStore.is_active = false;
//     existingStore.updated_at=new Date();
//     existingStore.updated_by = userId;

//     return storeRepo.save(existingStore);
// }
export async function deleteStore(storeId: number, userId: number,sessionId: number) {
  return AppDataSource.manager.transaction(async (manager) => {
    const stores = manager.getRepository(Store);
    const users = manager.getRepository(User);
    const roles = manager.getRepository(Role);
    const auditRepo = manager.getRepository(Audit);

    const existingStore = await stores.findOne({ where: { store_id: storeId } });
    if (!existingStore) {
      throw new Error("Store not found.");
    }
    if (!existingStore.is_active) {
      throw new Error("This store is already deactivated.");
    }

    const actingUser = await users.findOne({ where: { user_id: userId } });
    if (!actingUser || !actingUser.is_active) {
      throw new Error("Acting user not found or inactive.");
    }

    const actingRole = await roles.findOne({ where: { role_id: actingUser.role_id } });
    const isOwner = actingRole?.role_name.toUpperCase() === "OWNER";
    if (!isOwner || actingUser.store_id !== storeId) {
      throw new Error("Only this store's OWNER can deactivate it.");
    }

    const otherActiveUsers = await users.count({
      where: { store_id: storeId, is_active: true, user_id: Not(userId) },
    });
    if (otherActiveUsers > 0) {
      throw new Error(`Cannot deactivate this store — ${otherActiveUsers} other active user(s) still attached. Reassign or deactivate them first.`);
    }

    existingStore.is_active = false;
    existingStore.updated_at = new Date();
    existingStore.updated_by = userId;

    const savedStore = await stores.save(existingStore);

    const deleteActionTypeId = await getActionTypeId(manager, "DELETE");

    await auditRepo.insert({
      table_name: "transactions_store",
      record_id: savedStore.store_id,
      action_type_id: deleteActionTypeId,
      store_id: savedStore.store_id,
      session_id: sessionId,
      ip_address: null,
      is_active: true,
    });

    return savedStore;
  });
}






