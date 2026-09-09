import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { User } from "../entity/TransactionsUser.js";
import { createAuditRecordService } from "./AuditServices.js";

// import { AppError } from "../utils/AppError.js";

const roleRepo = AppDataSource.getRepository(Role);
const userRepo = AppDataSource.getRepository(User);

export interface RoleData {
    role_name: string;
    is_active: boolean;
}

export interface RoleAuditData {
    userId: number;
    storeId: number;
    sessionId: number;
}


// ======================================================
// GET ALL ACTIVE ROLES
// ======================================================

export async function getRoles() {

    const existingRoles = await roleRepo.find({
        where: {
            is_active: true
        },
        order: {
            role_id: "ASC"
        }
    });

    return existingRoles;
}


// ======================================================
// GET ROLE BY ID
// ======================================================

export async function getRoleById(roleId: number) {

    const existingRole = await roleRepo.findOne({
        where: {
            role_id: roleId
        }
    });

    if (!existingRole) {
        throw new Error("Role not found.");
    }

    return existingRole;
}

//=======================================================
//GET ROLEID FROM NAME
//=======================================================
// export async function getRoleByName(roleName: string) {

//     const existingRole = await roleRepo.findOne({
//         where: {
//             role_name: roleName,
//             is_active:true
//         }
//     });

//     if (!existingRole) {
//         throw new Error("Role not found.");
//     }

//     return existingRole;
// }


// ======================================================
// UPDATE ROLE
// ======================================================

export async function updateRole(
    roleId: number,
    data: Partial<RoleData>,
    auditData: RoleAuditData
) {

    return await AppDataSource.transaction(async (manager) => {

        const roleRepository = manager.getRepository(Role);

        const existingRole = await roleRepository.findOne({
            where: {
                role_id: roleId
            }
        });

        if (!existingRole) {
            throw new Error("Role not found.");
        }

        if (
            data.role_name !== undefined &&
            data.role_name !== existingRole.role_name
        ) {

            const duplicate = await roleRepository.findOne({
                where: {
                    role_name: data.role_name
                }
            });

            if (duplicate) {
                throw new Error(
                    "A role with this name already exists."
                );
            }

            existingRole.role_name = data.role_name;
        }

        if (data.is_active !== undefined) {
            existingRole.is_active = data.is_active;
        }

        existingRole.updated_at = new Date();

        const updatedRole = await roleRepository.save(existingRole);


        // ======================================================
        // AUDIT
        // ======================================================

        const audit = await createAuditRecordService(
            manager,
            {
                tableName: "master_role",
                recordId: updatedRole.role_id,
                actionTypeName: "UPDATE",
                userId: auditData.userId,
                storeId: auditData.storeId,
                sessionId: auditData.sessionId
            }
        );


        return {
            role: updatedRole,
            audit
        };
    });
}


// ======================================================
// CREATE ROLE
// ======================================================

export async function createRole(
    data: RoleData,
    auditData: RoleAuditData
) {

    return await AppDataSource.transaction(async (manager) => {

        const roleRepository = manager.getRepository(Role);

        const {
            role_name,
            is_active = true
        } = data;

        const existingRole = await roleRepository.findOne({
            where: {
                role_name: data.role_name
            }
        });

        if (existingRole) {
            throw new Error("Role already exists.");
        }

        const newRole = roleRepository.create({
            role_name,
            is_active,
            created_at: new Date()
        });

        const savedRole = await roleRepository.save(newRole);


        // ======================================================
        // AUDIT
        // ======================================================

        const audit = await createAuditRecordService(
            manager,
            {
                tableName: "master_role",
                recordId: savedRole.role_id,
                actionTypeName: "INSERT",
                userId: auditData.userId,
                storeId: auditData.storeId,
                sessionId: auditData.sessionId
            }
        );


        return {
            role: savedRole,
            audit
        };
    });
}


// ======================================================
// DELETE / DEACTIVATE ROLE
// ======================================================

export async function deleteRole(
    roleId: number,
    auditData: RoleAuditData
) {

    return await AppDataSource.transaction(async (manager) => {

        const roleRepository = manager.getRepository(Role);
        const userRepository = manager.getRepository(User);

        const existingRole = await roleRepository.findOne({
            where: {
                role_id: roleId
            }
        });

        if (!existingRole) {
            throw new Error("Role not found.");
        }

        // 409
        if (!existingRole.is_active) {
            throw new Error(
                "This role is already deactivated."
            );
        }

        const usersWithRole = await userRepository.count({
            where: {
                role_id: roleId,
                is_active: true
            }
        });

        if (usersWithRole > 0) {
            throw new Error(
                `Cannot deactivate this role — ${usersWithRole} active user(s) still have it. Reassign them first.`
            );
        }

        existingRole.is_active = false;
        existingRole.updated_at = new Date();

        const updatedRole = await roleRepository.save(
            existingRole
        );


        // ======================================================
        // AUDIT
        // ======================================================

        const audit = await createAuditRecordService(
            manager,
            {
                tableName: "master_role",
                recordId: updatedRole.role_id,
                actionTypeName: "DELETE",
                userId: auditData.userId,
                storeId: auditData.storeId,
                sessionId: auditData.sessionId
            }
        );


        return {
            role: updatedRole,
            audit
        };
    });
}