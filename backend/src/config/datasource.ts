import "reflect-metadata";

import { DataSource } from "typeorm";

import { Role } from "../entity/MasterRole.js";
import { Type } from "../entity/MasterProductType.js";
import { Brand } from "../entity/MasterProductBrand.js";
import { MovementType } from "../entity/MasterMovementType.js";
import { DiscountType } from "../entity/MasterDiscountType.js";
import { UoM } from "../entity/MasterUoM.js";

import { User } from "../entity/TransactionsUser.js";
import { Store } from "../entity/TransactionsStore.js";
import { Customer } from "../entity/TransactionsCustomer.js";
// import { CustomerUser } from "../entity/TransactionsCustomerUser.js";
import { Bill } from "../entity/TransactionsBill.js";
import { Inventory } from "../entity/TransactionsInventory.js";
import { Product } from "../entity/TransactionsSession.js";
import { Discount } from "../entity/TransactionsDiscount.js";
import { Damage } from "../entity/TransactionsDamagedGoods.js";
import { StockMov } from "../entity/TransactionsStockMovement.js";
import { Session } from "../entity/TransactionsSession.js";
import { Audit } from "../entity/TransactionsAudit.js";


export const AppDataSource = new DataSource({

    type: "sqlite",

    database: "shop_inventory.sqlite",

    synchronize: true,

    logging: false,

    entities: [
        DiscountType,          
        MovementType,          
        Brand,          
        Type,           
        Role,                  
        UoM,                 
        Audit,           
        Bill,          
        Customer,        
        CustomerUser,  
        Damage,  
        Discount,   
        Inventory,       
        Product,         
        Session         
        StockMov,   
        Store,           
        User,

    ],

    migrations: [],

    subscribers: []
});
