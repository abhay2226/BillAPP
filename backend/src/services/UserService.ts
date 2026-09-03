import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";



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
        }
    })

    return existingUsers;
}

//=========================================================================
//single user by id
//=========================================================================
export async function getUserById(userId: number){
    const existingUser = await userRepo.findOne({ 
        where: { user_id: userId }
        
    })

    if (!existingUser) {
         throw new Error("User not found."); 
    }

    return existingUser;
}



//=========================================================================
//update user
//=========================================================================
export async function updateUser(data:Partial<UserData>,userId:number ){

    // const {
    //     user_name,
    //     is_active= true
    // } = data
    const existingUser = await userRepo.findOne({ 
        where: { user_id: userId }
        
    })

    if (!existingUser) {
         throw new Error("User not found."); 
    }

    if(data.firstname!== undefined && data.firstname!== existingUser.firstname){
        const duplicate = await userRepo.findOne({
            where:{
                firstname: data.firstname
            },
        });
        if (duplicate) { 
        throw new Error("A User with this name already exists."); 
        }

        existingUser.firstname=data.firstname;
    }
    // if(data.lastname !== undefined && data.lastname !== existingUser.lastname){
    //     const duplicate = await userRepo.findOne({
    //         where:{
    //             lastname: data.lastname
    //         },
    //     });
    //     if (duplicate) { 
    //     throw new Error("A User with this last name already exists."); 
    //     }

    //     existingUser.lastname=data.lastname;
    // }


    if (data.is_active !== undefined) { 
        existingUser.is_active = data.is_active; 
    }

    existingUser.updated_at = new Date();
    existingUser.updated_by = userId;
    
    const updatedUser = await userRepo.save(existingUser); 
    
    return updatedUser; 
}

//=========================================================================
//deactive user
//=========================================================================
export async function deleteUser(userId:number){

    const existingUser = await userRepo.findOne({ 
        where: { user_id: userId ,is_active: true }
        
    })

    if (!existingUser) {
         throw new Error("User not found."); 
    }

    //409
    if (!existingUser.is_active) {
         throw new Error("This user is already deactivated."); 
    }

    existingUser.is_active = false;
    existingUser.updated_at=new Date();
    existingUser.updated_by = userId;
  
    return userRepo.save(existingUser);
}
