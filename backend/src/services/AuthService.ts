import { AppDataSource } from "../datasource.js";
import { In } from "typeorm";

import { User } from "../entity/TransactionsUser.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { Session } from "../entity/TransactionsSession.js";

import { listStoresForSignup } from "./StoreServices.js";
import { getRoleById ,getRoles } from "./Role.js";

import { hashPassword , comparePassword } from "../utils/passwords.js";

import { signToken, verifyToken } from "../utils/jwt.js";

import { isUniqueConstraintError } from "./Error.js";


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
export async function getSignupStores(search?: string) {
    return listStoresForSignup(search);
}


//=========================================================================
//signup
//=========================================================================

export async function signUp(data: SignUpData) {
  const { firstname, lastname, email, password, role_id, store_id, store_name, gst_no, location } = data;

  const existingUser = await userRepo.findOne({ where: { email } });
  if (existingUser) {
    throw new Error("An user with this email exists already.");
  }

  const role = await getRoleById(role_id);
  if (!role.is_active) {
    throw new Error("Role does not exist or is inactive.");
  }
  const roleName = role.role_name.toUpperCase();

  const passwordHash = await hashPassword(password);

  const savedUser = await AppDataSource.manager.transaction(async (manager) => {
    const stores = manager.getRepository(Store);
    const users = manager.getRepository(User);

    let targetStoreId: number;
    let createdNewStore = false;

    if (store_id) {
      if (roleName === "OWNER") {
        throw new Error("Cannot register as OWNER of an existing store.");
      }
      const selectedStore = await stores.findOne({ where: { store_id } });
      if (!selectedStore || !selectedStore.is_active) {
        throw new Error("Selected store does not exist or is inactive.");
      }
      targetStoreId = selectedStore.store_id;
    } else {
      if (roleName !== "OWNER") {
        throw new Error("A store_id is required unless registering as OWNER of a new store.");
      }
      if (!store_name) throw new Error("Store name is required to create a new store.");
      if (!gst_no) throw new Error("Gst_no is required to create a new store.");

      const existingByName = await stores.findOne({ where: { store_name } });
      if (existingByName) throw new Error("Store already exists.");
      const existingByGst = await stores.findOne({ where: { gst_no } });
      if (existingByGst) throw new Error("A store with this GST number already exists.");

      const newStore = stores.create({
        store_name,
        gst_no,
        location: location ?? null,
        is_active: true,
        created_at: new Date(),
        created_by: null,   // the future owner doesn't exist yet
        updated_at: null,
        updated_by: null,
      });
      const savedStore = await stores.save(newStore);
      targetStoreId = savedStore.store_id;
      createdNewStore = true;
    }

    const newUser = users.create({
      firstname,
      lastname: lastname || null,
      email,
      password_hash: passwordHash,
      role_id,
      store_id: targetStoreId,
      created_at: new Date(),
      created_by: null,   // self-registered — no one "created" this account
      updated_at: null,
      updated_by: null,
    });

    let savedUser;
    try {
      savedUser = await users.save(newUser);
    } catch (err) {
      if (isUniqueConstraintError(err)) {
        throw new Error("An user with this email exists already.");
      }
      throw err;
    }

    if (createdNewStore) {
      // Now that the user has a real ID, credit them as the store's creator
      await stores.update({ store_id: targetStoreId }, { created_by: savedUser.user_id });
    }

    return savedUser;
  });

  const token = signToken({
    userId: savedUser.user_id,
    email: savedUser.email,
    roleId: savedUser.role_id,
    storeId: savedUser.store_id,
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
 
    return await AppDataSource.manager.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const sessions = manager.getRepository(Session);
 
        const existingUser = await users.findOne({
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
 
        // const ipAddress = req.headers["x-forwarded-for"] || requestIdleCallback.socket.remoteAddress || null;
        // const userAgent = req.headers["user-agent"] || "";
        // const parser = new UAParser(userAgent);
        // const deviceInfo = parser.getResult();
 
        const now = new Date();
 
        const expiresAt = new Date( now.getTime() + 86400 * 1000 );
 
        const sesssion = sessions.create({
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
 
        const savedSess = await sessions.save(sesssion);
 
        const token=signToken({
            userId: existingUser.user_id,
            email: existingUser.email,
            // roleId: existingUser.role_id,
            storeId: existingUser.store_id,
            sessionId: savedSess.session_id,
        })
 
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
    });
}


//=========================================================================
//logout
//=========================================================================

export async function logOut(token: string){ 
    let decodedToken;
    try {
        decodedToken = verifyToken(token);
    } catch (error) {
        throw new Error("Invalid or expired token.");
    }

    if(!decodedToken || !decodedToken.sessionId){
        throw new Error("Token does not carry a session — nothing to log out.");
    }

    const sessionId = decodedToken.sessionId;

    const existingSession = await sessionRepo.findOne({
        where: {
            session_id: sessionId,
            is_active: true
        }
    });

    if (!existingSession) {
        throw new Error("Session not found or already logged out.");
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