import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { User } from "../entity/TransactionsUser.js";
import { Session } from "../entity/TransactionsSession.js";

import { hashPassword } from "../utils/passwords.js";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError
} from "../utils/AppError.js";

const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);
const storeRepo = AppDataSource.getRepository(Store);

export interface UserData {
    firstname: string;
    lastname?: string | null;
    email: string;
    password_hash?: string;
    role_id: number;
    store_id: number;
    is_active?: boolean;
}

export interface CreateUserInput {
    firstname: string;
    lastname?: string;
    email: string;
    password: string;
    role_id: number;
}

//=========================================================================
// list users
//=========================================================================
export async function getUsers(storeId?: number) {
    const whereClause: any = { is_active: true };
    if (storeId) {
        whereClause.store_id = storeId;
    }

    const existingUsers = await userRepo.find({
        where: whereClause,
        order: {
            user_id: "ASC"
        },
        select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            role_id: true,
            store_id: true,
            is_active: true,
            created_at: true,
            updated_at: true
        }
    });

    return existingUsers;
}

//=========================================================================
// single user by id
//=========================================================================
export async function getUserById(userId: number) {
    const existingUser = await userRepo.findOne({
        where: { user_id: userId },
        select: {
            user_id: true,
            firstname: true,
            lastname: true,
            email: true,
            role_id: true,
            store_id: true,
            is_active: true,
            created_at: true,
            updated_at: true
        }
    });

    if (!existingUser) {
        throw new NotFoundError("User not found.");
    }

    return existingUser;
}

//=========================================================================
// update user
//=========================================================================
export async function updateUser(
    targetUserId: number,
    actingUserId: number,
    data: Partial<UserData>
) {
    return await AppDataSource.manager.transaction(async (manager) => {
        // Fix: Use manager-scoped repository throughout the transaction
        const users = manager.getRepository(User);

        const existingUser = await users.findOne({
            where: { user_id: targetUserId }
        });

        if (!existingUser) {
            throw new NotFoundError("User not found.");
        }

        if (data.email && data.email.trim().toLowerCase() !== existingUser.email) {
            const duplicate = await users.findOne({
                where: { email: data.email.trim().toLowerCase() }
            });
            if (duplicate) {
                throw new ConflictError("Email already in use.");
            }
            existingUser.email = data.email.trim().toLowerCase();
        }

        if (data.firstname !== undefined) {
            existingUser.firstname = data.firstname.trim();
        }

        if (data.lastname !== undefined) {
            existingUser.lastname = data.lastname ? data.lastname.trim() : null;
        }

        if (data.role_id !== undefined) {
            existingUser.role_id = data.role_id;
        }

        if (data.is_active !== undefined) {
            existingUser.is_active = data.is_active;
        }

        existingUser.updated_at = new Date();
        existingUser.updated_by = actingUserId;

        const updatedUser = await users.save(existingUser);

        return {
            user_id: updatedUser.user_id,
            firstname: updatedUser.firstname,
            lastname: updatedUser.lastname,
            email: updatedUser.email,
            role_id: updatedUser.role_id,
            store_id: updatedUser.store_id,
            is_active: updatedUser.is_active,
            updated_at: updatedUser.updated_at
        };
    });
}

//=========================================================================
// create user by Admin or Owner (within their store)
//=========================================================================
export async function createUserByAdmin(
    actingUserId: number,
    storeId: number,
    input: CreateUserInput
) {
    return await AppDataSource.manager.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const roles = manager.getRepository(Role);
        const stores = manager.getRepository(Store);

        const actingUser = await users.findOne({ where: { user_id: actingUserId, is_active: true } });
        if (!actingUser) throw new NotFoundError("Acting user not found or inactive.");

        const actingRole = await roles.findOne({ where: { role_id: actingUser.role_id } });
        const actingRoleName = actingRole?.role_name.toUpperCase();

        if (actingRoleName !== "OWNER") {
            throw new ForbiddenError("Only the store OWNER can create new users.");
        }

        const targetRole = await roles.findOne({ where: { role_id: input.role_id } });
        if (!targetRole || !targetRole.is_active) {
            throw new BadRequestError("Target role does not exist or is inactive.");
        }
        const targetRoleName = targetRole.role_name.toUpperCase();

        if (targetRoleName === "OWNER") {
            throw new ForbiddenError("Cannot create another OWNER account through user creation.");
        }

        const normalizedEmail = input.email.trim().toLowerCase();
        const existing = await users.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            throw new ConflictError("A user with this email already exists.");
        }

        const store = await stores.findOne({ where: { store_id: storeId, is_active: true } });
        if (!store) {
            throw new NotFoundError("Store not found or is inactive.");
        }

        const passwordHash = await hashPassword(input.password);
        const now = new Date();

        const newUser = users.create({
            firstname: input.firstname.trim(),
            lastname: input.lastname?.trim() || null,
            email: normalizedEmail,
            password_hash: passwordHash,
            role_id: targetRole.role_id,
            store_id: storeId,
            is_active: true,
            created_at: now,
            created_by: actingUserId,
            updated_at: null,
            updated_by: null
        });

        const savedUser = await users.save(newUser);

        return {
            userId: savedUser.user_id,
            firstname: savedUser.firstname,
            lastname: savedUser.lastname,
            email: savedUser.email,
            roleId: savedUser.role_id,
            storeId: savedUser.store_id,
            isActive: savedUser.is_active,
            createdAt: savedUser.created_at
        };
    });
}

//=========================================================================
// deactivate user (only deactivates user and revokes their sessions)
// Store closure is separated into POST /stores/:storeId/close
//=========================================================================
export async function deactivateUserWithOwnershipRules(
    targetUserId: number,
    actingUserId: number
) {
    return AppDataSource.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const roles = manager.getRepository(Role);
        const sessions = manager.getRepository(Session);
        const stores = manager.getRepository(Store);

        const targetUser = await users.findOne({
            where: {
                user_id: targetUserId,
                is_active: true
            }
        });

        if (!targetUser) {
            throw new NotFoundError("Target user not found or already inactive.");
        }

        const actingUser = await users.findOne({
            where: {
                user_id: actingUserId,
                is_active: true
            }
        });

        if (!actingUser) {
            throw new NotFoundError("Acting user not found or inactive.");
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

        const actingIsOwner = actingUser.role_id === ownerRole.role_id;
        const targetIsOwner = targetUser.role_id === ownerRole.role_id;
        const isSelfDeactivation = targetUser.user_id === actingUser.user_id;

        if (!actingIsOwner && !isSelfDeactivation) {
            throw new ForbiddenError("Only an OWNER can deactivate other users.");
        }

        if (actingIsOwner && actingUser.store_id !== targetUser.store_id) {
            throw new ForbiddenError("You can only manage users in your own store.");
        }

        // If an owner is self-deactivating: check if they are the sole active owner of an active store
        if (targetIsOwner) {
            const otherActiveOwners = await users.count({
                where: {
                    store_id: targetUser.store_id,
                    role_id: ownerRole.role_id,
                    is_active: true
                }
            });

            if (otherActiveOwners <= 1) {
                const store = await stores.findOne({ where: { store_id: targetUser.store_id } });
                if (store && store.is_active) {
                    throw new ConflictError(
                        "Cannot deactivate the sole active OWNER of an open store. Transfer ownership to another user or close the store first via POST /stores/:storeId/close."
                    );
                }
            }
        }

        const now = new Date();

        // 1. Deactivate ONLY the target user
        targetUser.is_active = false;
        targetUser.updated_at = now;
        targetUser.updated_by = actingUserId;
        const savedUser = await users.save(targetUser);

        // 2. Revoke all active sessions belonging to the deactivated user
        await manager.update(
            Session,
            {
                user_id: targetUserId,
                is_active: true
            },
            {
                is_active: false,
                status: "INACTIVE",
                logout_at: now
            }
        );

        return {
            userId: savedUser.user_id,
            firstname: savedUser.firstname,
            lastname: savedUser.lastname,
            email: savedUser.email,
            roleId: savedUser.role_id,
            storeId: savedUser.store_id,
            isActive: savedUser.is_active,
            updatedAt: savedUser.updated_at
        };
    });
}

//=========================================================================
// restore user
//=========================================================================
export async function restoreUser(
    targetUserId: number,
    actingUserId: number
) {
    return AppDataSource.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const roles = manager.getRepository(Role);
        const stores = manager.getRepository(Store);

        const targetUser = await users.findOne({
            where: {
                user_id: targetUserId
            }
        });

        if (!targetUser) {
            throw new NotFoundError("Target user not found.");
        }

        if (targetUser.is_active) {
            throw new ConflictError("This user is already active.");
        }

        const actingUser = await users.findOne({
            where: {
                user_id: actingUserId,
                is_active: true
            }
        });

        if (!actingUser) {
            throw new NotFoundError("Acting user not found or inactive.");
        }

        const ownerRole = await roles.findOne({ where: { role_name: "OWNER", is_active: true } });
        const actingIsOwner = ownerRole ? actingUser.role_id === ownerRole.role_id : false;

        if (!actingIsOwner) {
            throw new ForbiddenError("Only the store OWNER can restore deactivated users.");
        }

        if (actingUser.store_id !== targetUser.store_id) {
            throw new ForbiddenError("You can only restore users in your own store.");
        }

        const store = await stores.findOne({ where: { store_id: targetUser.store_id } });
        if (!store || !store.is_active) {
            throw new ConflictError("Cannot restore a user to a closed or inactive store. Restore the store first.");
        }

        const now = new Date();
        targetUser.is_active = true;
        targetUser.updated_at = now;
        targetUser.updated_by = actingUserId;

        const savedUser = await users.save(targetUser);

        return {
            userId: savedUser.user_id,
            firstname: savedUser.firstname,
            lastname: savedUser.lastname,
            email: savedUser.email,
            roleId: savedUser.role_id,
            storeId: savedUser.store_id,
            isActive: savedUser.is_active,
            updatedAt: savedUser.updated_at
        };
    });
}
