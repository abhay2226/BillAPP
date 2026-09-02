import { AppDataSource } from "./datasource.js";

import { Role } from "./entity/MasterRole.js";

async function seedRole(){
    await AppDataSource.initialize();
    console.log("Database connected.");
    const roleRepo = AppDataSource.getRepository(Role);
    const roles = ["OWNER","MANAGER","CASHIER","ADMIN","STAFF"];
    for (const roleName of roles) { 
        const existingRole = await roleRepo.findOne({ 
            where: { role_name: roleName } 
        }); 
        if (existingRole) { 
            console.log( `${roleName} already exists.` ); 
            continue; 
        } 
        const role = roleRepo.create({ 
            role_name: roleName, 
            is_active: true,
            created_at: new Date()
        }); 
        await roleRepo.save(role); 
        console.log( `${roleName} created.` ); 
    } 
    console.log("Role seeding completed.");
    await AppDataSource.destroy();
}

seedRole() 
    .catch((error) => { 
        console.error( "Role seeding failed:", error ); 
        process.exit(1); 
    });