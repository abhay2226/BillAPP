import { AppDataSource } from "../datasource.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";

// import { AppError } from "../utils/AppError.js";

const storeRepo = AppDataSource.getRepository(Store);
const userRepo = AppDataSource.getRepository(User);

export interface StoreData{
    store_name: string;
    is_active: boolean;
    gst_no: string ;
    location: string | null;
    // created_at: Date;
    // created_by: number | null;
    // updated_at: Date | null;
    // updated_by: number | null
}


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

export async function getStoreById(storeId: number){
    const existingStore = await storeRepo.findOne({ 
        where: { store_id: storeId }
        
    })

    if (!existingStore) {
         throw new Error("Store not found."); 
    }

    return existingStore;
}

export async function createStore(data: StoreData){

    const {
        store_name,
        is_active= true,
        gst_no,
        location
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
