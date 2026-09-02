import { AppDataSource } from "../datasource.js";
import { In } from "typeorm";

import { User } from "../entity/TransactionsUser.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { Session } from "../entity/TransactionsSession.js";

import { listStoresForSignup ,createStore, getStoreById } from "./StoreServices.js";
import { getRoleById ,getRoles } from "./Role.js";

import { hashPassword , comparePassword } from "../utils/passwords.js";

import { signToken, verifyToken } from "../utils/jwt.js";


//repositories

const userRepo = AppDataSource.getRepository(User);
const roleRepo = AppDataSource.getRepository(Role);
const storeRepo = AppDataSource.getRepository(Store);
const sessionRepo = AppDataSource.getRepository(Session);

// types

export interface SignUpData{
    firstname: string;
    lastname?: string; 
    email: string; 
    password: string;

    role_id: number; 

    store_id?: number;
    store_name?: string; 
    gst_no?: string; 
    location?: string;
}

export interface LogInData{
    email: string; 
    password: string;
}


//=========================================================================
//get roles for signup
//=========================================================================

export async function getSignupRoles() { 
    return getRoles(); 
}

//=========================================================================
//get stores for signup
//=========================================================================
export async function getSignupStores() {
    return listStoresForSignup();
}


//=========================================================================
//signup
//=========================================================================

export async function signUp(data:SignUpData){
    const {
        firstname,
        lastname, 
        email, 
        password,
        role_id,
        store_id,
        store_name,
        gst_no,
        location
    } = data;

    //check for email
    
    const existingUser = await userRepo.findOne({
        where:{
            email
        }
    });

    if(existingUser){
        throw new Error("An user with this email exists already.");
    }

    const role = await getRoleById(role_id);
    if (!role.is_active) {
        throw new Error(`Role does not exist or is inactive.`);
    }

    const roleName=role.role_name.toUpperCase();


    let targetStoreId: number;

    if (roleName === "OWNER") {
        if (store_id) {
            const selectedStore = await getStoreById(store_id);
            if (!selectedStore.is_active) {
                throw new Error("Selected store does not exist or is inactive.");
            }
            targetStoreId = selectedStore.store_id;
        } else {
            if (!store_name) {
                throw new Error("Store name is required to create a new store.");
            }
            if (!gst_no) {
                throw new Error("Gst_no is required to create a new store.");
            }
    
            const newStore = await createStore({
                store_name,
                gst_no,
                location: location ?? null
            });
    
            targetStoreId = newStore.store_id;
        }
    } else {
        if (!store_id) {
            throw new Error("A non-owner user must provide a valid store_id.");
        }
    
        const selectedStore = await getStoreById(store_id);
        if (!selectedStore.is_active) {
            throw new Error("Selected store does not exist or is inactive.");
        }
    
        targetStoreId = selectedStore.store_id;
    }
    
    const passwordHash = await hashPassword(password);

    const user = userRepo.create({
        firstname,
        lastname: lastname || null, 
        email, 
        password_hash : passwordHash,
        role_id, 
        store_id: targetStoreId,
        created_at: new Date(), 
        created_by: null, 
        updated_at: null, 
        updated_by: null
    });

    const savedUser = await userRepo.save(user);

    const token=signToken({
        userId: savedUser.user_id,
        email: savedUser.email,
        roleId: savedUser.role_id,
        storeId: savedUser.store_id
    });

    return({
        token,
        user:{
            userId: savedUser.user_id,
            firstname:savedUser.firstname,
            lastname:savedUser.lastname,
            email: savedUser.email,
            roleId: savedUser.role_id,
            storeId: savedUser.store_id
        }
    });

}

//=========================================================================
//login
//=========================================================================

export async function logIn(
    data:SignUpData,
    // req: Request, 
    // res: Response
){
    const { 
        email, 
        password,
    } = data;

    const existingUser = await userRepo.findOne({
        where:{
            email
        }
    });

    if(!existingUser){
        throw new Error("Invalid Email or User does not exists.Create a new account.");
    }

    if (!existingUser.is_active) { 
        throw new Error( "This user account is inactive." ); 
    }

    const passwordMatch= await comparePassword(password,existingUser.password_hash);

    if (!passwordMatch){
        throw new Error("InValid Password");
    }

    if (!existingUser.store_id) { 
        throw new Error( "User is not associated with a store." ); 
    }

    const token=signToken({
        userId: existingUser.user_id,
        email: existingUser.email,
        // roleId: existingUser.role_id,
        storeId: existingUser.store_id
    })

    // const ipAddress = req.headers["x-forwarded-for"] || requestIdleCallback.socket.remoteAddress || null;
    // const userAgent = req.headers["user-agent"] || "";
    // const parser = new UAParser(userAgent);
    // const deviceInfo = parser.getResult();

    const now = new Date();

    const expiresAt = new Date( now.getTime() + 86400 * 1000 );

    const sesssion = sessionRepo.create({ 
        user_id: existingUser.user_id, 
        store_id: existingUser.store_id, 
        login_at:now,
        logout_at: null,
        expires_at: expiresAt,
        last_active_at: now, 
        ip_address: null, 
        device_type: null, 
        device_info: null, 
        status: "ACTIVE", 
        is_active: true, 
        created_at: new Date()
    });

    const savedSess = await sessionRepo.save(sesssion);

    return({
        token,
        user:{
            userId: existingUser.user_id,
            firstname:existingUser.firstname,
            lastname:existingUser.firstname,
            email: existingUser.email,
            roleId: existingUser.role_id,
            storeId: existingUser.store_id,
            sessionId: savedSess.session_id
        }
    });

}
