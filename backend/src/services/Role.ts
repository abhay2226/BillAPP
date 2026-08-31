import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";

const roleRepo = AppDataSource.getRepository(Role);
export async function getRoles(){
    
}