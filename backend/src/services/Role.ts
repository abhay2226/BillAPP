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

export async function updateRole(roleId: number, data:Partial<RoleData> ){

    // const {
    //     role_name,
    //     is_active= true
    // } = data
    const existingRole = await roleRepo.findOne({ 
        where: { role_id: roleId }
        
    })

    if (!existingRole) {
         throw new Error("Role not found."); 
    }

    if(data.role_name!== undefined && data.role_name!== existingRole.role_name){
        const duplicate = await roleRepo.findOne({
            where:{
                role_name: data.role_name
            },
        });
        if (duplicate) { 
        throw new Error("A role with this name already exists."); 
        }

        existingRole.role_name=data.role_name;
    }

    if (data.is_active !== undefined) { 
        existingRole.is_active = data.is_active; 
    }
    
    existingRole.updated_at = new Date();
    const updatedRole = await roleRepo.save(existingRole); 
    
    return updatedRole; 
}

export async function createRole(data: RoleData){

    const {
        role_name,
        is_active = true
     } = data

    const existingRole = await roleRepo.findOne({ 
        where: { 
            role_name:data.role_name  
        }
        
    })

    if (existingRole) {
         throw new Error("Role already exists."); 
    }

    const newRole = await roleRepo.create({
        role_name,
        is_active,
        created_at: new Date()
    })

    const savedRole = await roleRepo.save(newRole); 
    
    return savedRole; 
}

export async function deleteRole(roleId: number){

    const existingRole = await roleRepo.findOne({ 
        where: { role_id: roleId }
        
    })

    if (!existingRole) {
         throw new Error("Role not found."); 
    }

    //409
    if (!existingRole.is_active) {
         throw new Error("This role is already deactivated."); 
    }

    const usersWithRole = await userRepo.count({
    where: { role_id: roleId, is_active: true },
  });

  if (usersWithRole > 0) {
    throw new Error(`Cannot deactivate this role — ${usersWithRole} active user(s) still have it. Reassign them first.`);
  }

  existingRole.is_active = false;
  existingRole.updated_at=new Date();

  return roleRepo.save(existingRole);
}
