import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { User } from "../entity/TransactionsUser.js";

// import { AppError } from "../utils/AppError.js";

const roleRepo = AppDataSource.getRepository(Role);
const userRepo = AppDataSource.getRepository(User);

export interface RoleData{
    role_name: string;
    is_active: boolean;
}



export async function getRoles(){
    const existingRoles = await roleRepo.find({
        where:{
            is_active: true
        },
        order:{
            role_id:"ASC"
        }
    })

    return existingRoles;
}

export async function getRoleById(roleId: number){
    const existingRole = await roleRepo.findOne({ 
        where: { role_id: roleId }
        
    })

    if (!existingRole) {
         throw new Error("Role not found."); 
    }

    return existingRole;
}
