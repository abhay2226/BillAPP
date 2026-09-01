import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";

// import { AppError } from "../utils/AppError.js";
import { In } from "typeorm";

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
export async function listStoresForSignup(){
    const stores = await storeRepo.find({
        where:{
            is_active:true
        },
        order:{
            store_name:"ASC"
        },
    });
    if(!stores || stores.length===0){
        throw new Error("No active stores found.");
        return [];
    }
    
    const ownerRole = await roleRepo.findOne({
        where:{
            role_name:"OWNER",
            is_active:true
        }
    });

    if (!ownerRole) {
        throw new Error("OWNER role does not exist.");
    }

    const storeIds =stores.map((store)=> store.store_id);

    const owners = await userRepo.find({
        where:{
            store_id: In(storeIds),
            role_id: ownerRole.role_id,
            is_active:true
        }
    });

    const ownerByStoreIds = new Map(owners.map((owner) =>[owner.store_id,owner]));

    return stores.map((store) => {
    const owner = ownerByStoreIds.get(store.store_id);
    return {
      storeId: store.store_id,
      storeName: store.store_name,
      location: store.location,

      ownerUserId: owner ? owner.user_id : null,
      ownerName: owner ? `${owner.firstname}${owner.lastname ? " " + owner.lastname : ""}` : null,
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
//new store
//=========================================================================
export async function createStore(data: StoreData){

    const {
        store_name,
        gst_no,
        location,
        is_active = true
     } = data

    const existingStore = await storeRepo.findOne({ 
        where: { 
            store_name
        }
        
    })

    if (existingStore) {
         throw new Error("Store already exists."); 
    }

    const existingGst = await storeRepo.findOne({
        where: {
            gst_no
        }
    });

    if (existingGst) {
        throw new Error("A store with this GST number already exists.");
    }

    const newStore = await storeRepo.create({
        store_name,
        gst_no: data.gst_no,
        location: data.location ?? null,
        is_active,
        created_at: new Date(),
        created_by: null,
        updated_at: null,
        updated_by: null
    })

    const savedStore = await storeRepo.save(newStore); 
    
    return savedStore; 
}

//=========================================================================
//update store
//=========================================================================
export async function updateStore(storeId: number, data:Partial<StoreData>,userId:number ){

    // const {
    //     store_name,
    //     is_active= true
    // } = data
    const existingStore = await storeRepo.findOne({ 
        where: { store_id: storeId }
        
    })

    if (!existingStore) {
         throw new Error("Store not found."); 
    }

    if(data.store_name!== undefined && data.store_name!== existingStore.store_name){
        const duplicate = await storeRepo.findOne({
            where:{
                store_name: data.store_name
            },
        });
        if (duplicate) { 
        throw new Error("A Store with this name already exists."); 
        }

        existingStore.store_name=data.store_name;
    }
    if(data.gst_no !== undefined && data.gst_no !== existingStore.gst_no){
        const duplicate = await storeRepo.findOne({
            where:{
                gst_no: data.gst_no
            },
        });
        if (duplicate) { 
        throw new Error("A Store with this GST number already exists."); 
        }

        existingStore.gst_no=data.gst_no;
    }


    if (data.is_active !== undefined) { 
        existingStore.is_active = data.is_active; 
    }

    if (data.gst_no !== undefined) {
        existingStore.gst_no = data.gst_no;
    }

    if (data.location !== undefined) {
        existingStore.location = data.location;
    }

    existingStore.updated_at = new Date();
    existingStore.updated_by = userId;
    
    const updatedStore = await storeRepo.save(existingStore); 
    
    return updatedStore; 
}

//=========================================================================
//deactive store
//=========================================================================
export async function deleteStore(storeId: number, data: StoreData,userId:number){

    const existingStore = await storeRepo.findOne({ 
        where: { store_id: storeId }
        
    })

    if (!existingStore) {
         throw new Error("Store not found."); 
    }

    //409
    if (!existingStore.is_active) {
         throw new Error("This store is already deactivated."); 
    }

    const usersWithStore = await userRepo.count({
    where: { store_id: storeId, is_active: true },
  });

  if (usersWithStore > 0) {
    throw new Error(`Cannot deactivate this store — ${usersWithStore} active user(s) still have it. Reassign them first.`);
  }

  existingStore.is_active = false;
  existingStore.updated_at=new Date();
  existingStore.updated_by = userId;

  return storeRepo.save(existingStore);
}
