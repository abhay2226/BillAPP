import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";

const roleRepo = AppDataSource.getRepository(Role);

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

export async function updateRole(roleId: number, data: RoleData){

    const {
        role_name,
        is_active= true
    } = data
    const existingRole = await roleRepo.findOne({ 
        where: { role_id: roleId }
        
    })

    if (!existingRole) {
         throw new Error("Role not found."); 
    }

    if(data.role_name!== existingRole.role_name){
        const role = await roleRepo.findOne({
            where:{
                role_name: data.role_name
            },
        });
        if (role) { 
        throw new Error("A role with this name already exists."); 
        }

        existingRole.role_name=data.role_name;
    }

    if (data.is_active !== undefined) { 
        existingRole.is_active = data.is_active; 
    } 
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
        is_active
    })

    const savedRole = await roleRepo.save(newRole); 
    
    return savedRole; 
}

export async function deleteRole(roleId: number, data: RoleData){

    const existingRole = await roleRepo.findOne({ 
        where: { role_id: roleId }
        
    })

    if (!existingRole) {
         throw new Error("Role not found."); 
    }

    
}
