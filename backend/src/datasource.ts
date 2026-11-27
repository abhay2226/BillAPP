import "reflect-metadata";

import { DataSource } from "typeorm";
import {
    copyFileSync,
    existsSync,
    mkdirSync,
    statSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";

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
import { ActionType } from "./entity/MasterActionType.js";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const localDatabasePath = resolve(currentDirectory, "../shop_inventory.sqlite");
const appServiceStoragePath = process.env.WEBSITE_SITE_NAME
    ? resolve(
        process.env.HOME ??
            (process.platform === "win32" ? "D:\\home" : "/home"),
        "site"
    )
    : null;
const seedDatabasePath = process.env.SQLITE_SEED_DB_PATH
    ? resolve(process.env.SQLITE_SEED_DB_PATH)
    : appServiceStoragePath
        ? resolve(appServiceStoragePath, "shop_inventory_seed.sqlite")
        : localDatabasePath;
const defaultDatabasePath = appServiceStoragePath
    ? resolve(appServiceStoragePath, "shop_inventory.sqlite")
    : localDatabasePath;
const databasePath = process.env.SQLITE_DB_PATH
    ? resolve(process.env.SQLITE_DB_PATH)
    : defaultDatabasePath;

mkdirSync(dirname(databasePath), { recursive: true });

if (!existsSync(databasePath)) {
    if (!existsSync(seedDatabasePath)) {
        throw new Error(
            `SQLite database not found. Expected source: ${seedDatabasePath}`
        );
    }

    const seedStats = statSync(seedDatabasePath);
    if (seedStats.size === 0) {
        throw new Error("Original SQLite database is empty.");
    }

    copyFileSync(seedDatabasePath, databasePath);
    console.log("Existing SQLite database copied to persistent storage.");
}

console.log("SQLite source database:", seedDatabasePath);
console.log("Active SQLite database:", databasePath);

export const AppDataSource = new DataSource({
    type: "sqlite",
    driver: sqlite3,
    database: databasePath,
    synchronize:true,
    logging: false,
    entities: [
        ActionType,
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
