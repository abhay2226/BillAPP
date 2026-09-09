import { AppDataSource } from "../datasource.js";
import { In } from "typeorm";

import { User } from "../entity/TransactionsUser.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { Session } from "../entity/TransactionsSession.js";

import { listStoresForSignup } from "./StoreServices.js";
import { getRoleById } from "./Role.js";

import { hashPassword, comparePassword } from "../utils/passwords.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import { isUniqueConstraintError } from "./Errors.js";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError
} from "../utils/AppError.js";

// Repositories
const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);
const sessionRepo = AppDataSource.getRepository(Session);

// Types
export interface SignUpData {
    firstname: string;
    lastname?: string;
    email: string;
    password: string;
    role_id?: number;
    store_id?: number;
    store_name?: string;
    gst_no?: string;
    location?: string;
}

export interface LogInData {
    email: string;
    password: string;
}

//=========================================================================
// get roles for signup (public signup restricted to safe roles like STAFF)
//=========================================================================
export async function getSignupRoles() {
    return roleRepo.find({
        where: [
            { role_name: "OWNER", is_active: true },
            { role_name: "STAFF", is_active: true },
          ]
    });
}

//=========================================================================
// get stores for signup
//=========================================================================
export async function getSignupStores(search?: string) {
    return listStoresForSignup(search);
}

//=========================================================================
// signup
//=========================================================================
export async function signUp(data: SignUpData) {
    const { firstname, lastname, email, password, role_id, store_id, store_name, gst_no, location } = data;

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
        throw new ConflictError("A user with this email exists already.");
    }

    const passwordHash = await hashPassword(password);

    const { savedUser, savedSess } = await AppDataSource.manager.transaction(async (manager) => {
        const stores = manager.getRepository(Store);
        const users = manager.getRepository(User);
        const sessions = manager.getRepository(Session);
        const roles = manager.getRepository(Role);

        let targetStoreId: number;
        let targetRoleId: number;
        let createdNewStore = false;

        if (store_id) {
            const staffRole = await roles.findOne({ where: { role_name: "STAFF", is_active: true } });
            if (!staffRole) {
                throw new Error("STAFF role does not exist or is inactive.");
            }

            if (role_id !== undefined && role_id !== null) {
                const chosenRole = await roles.findOne({ where: { role_id } });
                if (!chosenRole || !chosenRole.is_active) {
                    throw new BadRequestError("Selected role does not exist or is inactive.");
                }
                if (chosenRole.role_name.toUpperCase() !== "STAFF") {
                    throw new ForbiddenError(
                        "signup to an existing store is restricted to STAFF role. "
                    );
                }
                targetRoleId = chosenRole.role_id;
            } else {
                targetRoleId = staffRole.role_id;
            }

            const selectedStore = await stores.findOne({ where: { store_id } });
            if (!selectedStore || !selectedStore.is_active) {
                throw new NotFoundError("Selected store does not exist or is inactive.");
            }
            targetStoreId = selectedStore.store_id;
        } else {
            // Creating a new store: user automatically gets OWNER role
            const ownerRole = await roles.findOne({ where: { role_name: "OWNER", is_active: true } });
            if (!ownerRole) {
                throw new Error("OWNER role does not exist or is inactive.");
            }
            targetRoleId = ownerRole.role_id;

            if (!store_name || !store_name.trim()) {
                throw new BadRequestError("Store name is required to create a new store.");
            }
            if (!gst_no || !gst_no.trim()) {
                throw new BadRequestError("GST number is required to create a new store.");
            }

            const existingByName = await stores.findOne({ where: { store_name: store_name.trim() } });
            if (existingByName) throw new ConflictError("Store with this name already exists.");

            const existingByGst = await stores.findOne({ where: { gst_no: gst_no.trim() } });
            if (existingByGst) throw new ConflictError("A store with this GST number already exists.");

            const newStore = stores.create({
                store_name: store_name.trim(),
                gst_no: gst_no.trim(),
                location: location ?? null,
                is_active: true,
                created_at: new Date(),
                created_by: null,
                updated_at: null,
                updated_by: null,
            });
            const savedStore = await stores.save(newStore);
            targetStoreId = savedStore.store_id;
            createdNewStore = true;
        }

        const newUser = users.create({
            firstname: firstname.trim(),
            lastname: lastname?.trim() || null,
            email: email.trim().toLowerCase(),
            password_hash: passwordHash,
            role_id: targetRoleId,
            store_id: targetStoreId,
            is_active: true,
            created_at: new Date(),
            created_by: null,
            updated_at: null,
            updated_by: null,
        });

        let savedUser;
        let savedSess;
        try {
            savedUser = await users.save(newUser);
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 86400 * 1000);

            const session = sessions.create({
                user_id: savedUser.user_id,
                store_id: savedUser.store_id,
                login_at: now,
                logout_at: null,
                expires_at: expiresAt,
                last_active_at: now,
                ip_address: null,
                device_type: null,
                device_info: null,
                status: "ACTIVE",
                is_active: true,
                created_at: now,
            });

            savedSess = await sessions.save(session);
        } catch (err) {
            if (isUniqueConstraintError(err)) {
                throw new ConflictError("A user with this email exists already.");
            }
            throw err;
        }

        if (createdNewStore) {
            await stores.update({ store_id: targetStoreId }, { created_by: savedUser.user_id });
        }

        return { savedUser, savedSess };
    });

    const token = signToken({
        userId: savedUser.user_id,
        email: savedUser.email,
        roleId: savedUser.role_id,
        storeId: savedUser.store_id,
        sessionId: savedSess.session_id,
    });

    return {
        token,
        user: {
            userId: savedUser.user_id,
            firstname: savedUser.firstname,
            lastname: savedUser.lastname,
            email: savedUser.email,
            roleId: savedUser.role_id,
            storeId: savedUser.store_id,
        },
    };
}

//=========================================================================
// login
//=========================================================================
export async function logIn(data: LogInData) {
    const { email, password } = data;

    return await AppDataSource.manager.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const stores = manager.getRepository(Store);
        const sessions = manager.getRepository(Session);

        const existingUser = await users.findOne({
            where: { email: email.trim().toLowerCase() }
        });

        if (!existingUser) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        if (!existingUser.is_active) {
            throw new UnauthorizedError("This user account is inactive. Please contact an administrator.");
        }

        const passwordMatch = await comparePassword(password, existingUser.password_hash);
        if (!passwordMatch) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        if (!existingUser.store_id) {
            throw new UnauthorizedError("User is not associated with a store.");
        }

        const ownerRole = await manager.getRepository(Role).findOne({ where: { role_name: "OWNER", is_active: true } });
        const isOwner = ownerRole ? existingUser.role_id === ownerRole.role_id : false;

        const store = await stores.findOne({ where: { store_id: existingUser.store_id } });
        if (!store || (!store.is_active && !isOwner)) {
            throw new UnauthorizedError("The store associated with this account is closed or inactive.");
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 86400 * 1000);

        const session = sessions.create({
            user_id: existingUser.user_id,
            store_id: existingUser.store_id,
            login_at: now,
            logout_at: null,
            expires_at: expiresAt,
            last_active_at: now,
            ip_address: null,
            device_type: null,
            device_info: null,
            status: "ACTIVE",
            is_active: true,
            created_at: now
        });

        const savedSess = await sessions.save(session);

        const token = signToken({
            userId: existingUser.user_id,
            email: existingUser.email,
            roleId: existingUser.role_id,
            storeId: existingUser.store_id,
            sessionId: savedSess.session_id,
        });

        return {
            token,
            user: {
                userId: existingUser.user_id,
                firstname: existingUser.firstname,
                lastname: existingUser.lastname,
                email: existingUser.email,
                roleId: existingUser.role_id,
                storeId: existingUser.store_id,
                sessionId: savedSess.session_id
            }
        };
    });
}

//=========================================================================
// logout
//=========================================================================
export async function logOut(token: string) {
    let decodedToken: any;
    try {
        decodedToken = verifyToken(token);
    } catch (error) {
        throw new UnauthorizedError("Invalid or expired token.");
    }

    if (!decodedToken || !decodedToken.sessionId) {
        throw new BadRequestError("Token does not carry a session — nothing to log out.");
    }

    const sessionId = decodedToken.sessionId;

    const existingSession = await sessionRepo.findOne({
        where: {
            session_id: sessionId
        }
    });

    if (!existingSession) {
        throw new NotFoundError("Session not found.");
    }

    if (!existingSession.is_active) {
        return { message: "Already logged out." };
    }

    existingSession.is_active = false;
    existingSession.status = "INACTIVE";
    existingSession.logout_at = new Date();

    await sessionRepo.save(existingSession);

    return { message: "Logged out successfully." };
}