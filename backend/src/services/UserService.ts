import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";

import { Product } from "../entity/TransactionsProduct.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { Bill } from "../entity/TransactionsBill.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { Session } from "../entity/TransactionsSession.js";
import { DamagedGoods } from "../entity/TransactionsDamagedGoods.js";
import { StockMovement } from "../entity/TransactionsStockMovement.js";

const storeRepo = AppDataSource.getRepository(Store);
const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);


export interface UserData {
  firstname: string;
  lastname?: string | null;
  email: string;
  password_hash: string;
  role_id: number;
  store_id: number;
  is_active?: boolean;
}


//=========================================================================
//list user 
//=========================================================================
export async function getUsers(){
    const existingUsers = await userRepo.find({
        where:{
            is_active: true
        },
        order:{
            user_id:"ASC"
        },
    });

    return existingUsers;
}

//=========================================================================
//single user by id
//=========================================================================
export async function getUserById(userId: number){
    const existingUser = await userRepo.findOne({ 
        where: { user_id: userId },
        
    });

    if (!existingUser) {
         throw new Error("User not found."); 
    }

    return existingUser;
}



//=========================================================================
//update user
//=========================================================================
export async function updateUser(targetUserId: number, actingUserId: number,data:Partial<UserData> ){

    // const {
    //     user_name,
    //     is_active= true
    // } = data
    const existingUser = await userRepo.findOne({ 
        where: { user_id: targetUserId }
        
    })

    if (!existingUser) {
         throw new Error("User not found."); 
    }

    if (data.firstname && data.firstname !== existingUser.firstname) {
      const duplicate = await userRepo.findOne({ where: { firstname: data.firstname } });
      if (duplicate) {
        throw new Error("Email already in use.");
      }   
      existingUser.firstname = data.firstname;
    }
    
    if (data.firstname !== undefined) {
        existingUser.firstname = data.firstname;
    }

    if (data.lastname !== undefined) {
    existingUser.lastname = data.lastname;
    }

    if (data.is_active !== undefined) { 
        existingUser.is_active = data.is_active; 
    }

    

    existingUser.updated_at = new Date();
    existingUser.updated_by = actingUserId;
    
    const updatedUser = await userRepo.save(existingUser); 
    
    return updatedUser; 
}

//=========================================================================
//deactive user
//=========================================================================
// export async function deleteUser(targetUserId: number, actingUserId: number){

//     const existingUser = await userRepo.findOne({ 
//         where: { user_id: targetUserId ,is_active: true }
        
//     })

//     if (!existingUser) {
//          throw new Error("User not found."); 
//     }

//     //409
//     if (!existingUser.is_active) {
//          throw new Error("This user is already deactivated."); 
//     }

//     existingUser.is_active = false;
//     existingUser.updated_at=new Date();
//     existingUser.updated_by = actingUserId;
  
//     return userRepo.save(existingUser);
// }

export async function deactivateUserWithOwnershipRules(targetUserId: number,actingUserId: number) {

    return AppDataSource.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const roles = manager.getRepository(Role);

        const targetUser = await users.findOne({
            where: {
                user_id: targetUserId,
                is_active: true
            }
        });

        if (!targetUser) {
            throw new Error("Target user not found or already inactive.");
        }

        const actingUser = await users.findOne({
            where: {
                user_id: actingUserId,
                is_active: true
            }
        });

        if (!actingUser) {
            throw new Error("Acting user not found or inactive.");
        }

        const ownerRole = await roles.findOne({
            where: {
                role_name: "OWNER",
                is_active: true
            }
        });

        if (!ownerRole) {
            throw new Error("OWNER role not found.");
        }

        const actingIsOwner =
            actingUser.role_id === ownerRole.role_id;

        const targetIsOwner =
            targetUser.role_id === ownerRole.role_id;

        const isSelfDeactivation =
            targetUser.user_id === actingUser.user_id;

        if (!actingIsOwner && !isSelfDeactivation) {
            throw new Error("Only an owner can deactivate users.");
        }

        if (actingIsOwner && actingUser.store_id!==targetUser.store_id){
            throw new Error(
                "You can only manage users in your own store."
            );
        }

        const now = new Date();

        targetUser.is_active = false;
        targetUser.updated_at = now;
        targetUser.updated_by = actingUserId;

        const savedUser = await users.save(targetUser);


        if (!isSelfDeactivation) {
            return savedUser;
        }

        // Owner deactivating a normal store user:
        // deactivate only that user.
        if (!targetIsOwner) {
            return savedUser;
        }

        const otherActiveOwners = await users.count({
            where: {
                store_id: targetUser.store_id,
                role_id: ownerRole.role_id,
                is_active: true
            }
        });

        if (otherActiveOwners > 0) {
            return savedUser;
        }

        // This block is reached only if your authorization policy
        // allows a non-owner administrator to deactivate an owner.
        await manager.update(
            Store,
            {
                store_id: targetUser.store_id
            },
            {
                is_active: false,
                updated_at: now,
                updated_by: actingUserId
            }
        );

        await manager.update(
            Product,
            {
                store_id: targetUser.store_id
            },
            {
                is_active: false,
                updated_at: now,
                updated_by: actingUserId
            }
        );

        await manager.update(
            Inventory,
            {
                store_id: targetUser.store_id
            },
            {
                is_active: false,
                updated_at: now,
                updated_by: actingUserId
            }
        );

        await manager.update(
            Bill,
            { store_id: targetUser.store_id },
            {
                is_active: false,
                updated_at: now,
                updated_by: actingUserId
            }
        );
        await manager.update(
            Discount,
            {
                store_id: targetUser.store_id
            },
            {
                is_active: false,
                updated_at: now,
                updated_by: actingUserId
            }
        );
        await manager.update(
            DamagedGoods,
            {
                store_id: targetUser.store_id
            },
            {
                is_active: false//,
                // updated_at: now,
                // updated_by: actingUserId
            }
        );

        await manager.update(
            StockMovement,
            {
                store_id: targetUser.store_id
            },
            {
                is_active: false,
                // updated_at: now,
                // updated_by: actingUserId
            }
        );

        await manager.update(
            Session,
            {
                store_id: targetUser.store_id,
                is_active: true
            },
            {
                is_active: false
            }
        );

        return savedUser;
    });
}


