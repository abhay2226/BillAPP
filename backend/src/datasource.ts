import "reflect-metadata";

import { DataSource } from "typeorm";

import { Role } from "./entity/MasterRole.js";
import { Type } from "./entity/MasterProductType.js";
import { Brand } from "./entity/MasterProductBrand.js";
import { MovementType } from "./entity/MasterMovementType.js";
import { ReferenceType } from "./entity/MasterReference.js";
import { DiscountType } from "./entity/MasterDiscountType.js";
import { UoM } from "./entity/MasterUoM.js";

import { User } from "./entity/TransactionsUser.js";
import { Store } from "./entity/TransactionsStore.js";
import { Customer } from "./entity/TransactionsCustomer.js";
import { Bill } from "./entity/TransactionsBill.js";
import { BillItem } from "./entity/TransactionsBillItem.js";
import { Inventory } from "./entity/TransactionsInventory.js";
import { Product } from "./entity/TransactionsProduct.js";
import { Discount } from "./entity/TransactionsDiscount.js";
import { DamagedGoods } from "./entity/TransactionsDamagedGoods.js";
import { StockMovement } from "./entity/TransactionsStockMovement.js";
import { Session } from "./entity/TransactionsSession.js";
import { Audit } from "./entity/TransactionsAudit.js";


export const AppDataSource = new DataSource({

    type: "sqlite",

    database: "shop_inventory.sqlite",

    synchronize: true,

    logging: false,

    entities: [
        DiscountType,          
        MovementType,
        ReferenceType,          
        Brand,          
        Type,           
        Role,                  
        UoM,                 
        Audit,           
        Bill, 
        BillItem,         
        Customer,          
        DamagedGoods,  
        Discount,   
        Inventory,       
        Product,         
        Session,         
        StockMovement,   
        Store,           
        User,

    ],

    migrations: [],

    subscribers: []
});
