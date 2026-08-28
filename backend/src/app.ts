import "reflect-metadata";
import express from "express";
import type { Application } from "express";

import Router from "express";
import { AppDataSource } from "./datasource.js";

import { Role } from "./entity/MasterRole.js";
import { Type } from "./entity/MasterProductType.js";
import { Brand } from "./entity/MasterProductBrand.js";
import { MovementType } from "./entity/MasterMovementType.js";
import { DiscountType } from "./entity/MasterDiscountType.js";
import { UoM } from "./entity/MasterUoM.js";

import { User } from "./entity/TransactionsUser.js";
import { Store } from "./entity/TransactionsStore.js";
import { Customer } from "./entity/TransactionsCustomer.js";
import { Bill } from "./entity/TransactionsBill.js";
import { Inventory } from "./entity/TransactionsInventory.js";
import { Product } from "./entity/TransactionsProduct.js";
import { Discount } from "./entity/TransactionsDiscount.js";
import { DamagedGoods } from "./entity/TransactionsDamagedGoods.js";
import { StockMovement } from "./entity/TransactionsStockMovement.js";
import { Session } from "./entity/TransactionsSession.js";
import { Audit } from "./entity/TransactionsAudit.js";


// speciesRouter.get("/", (req , res) => {

//     res.json({
//         message: "Species route working"
//     });

// });

//imports fr routes


//express app
const app: Application= express();
app.use(express.json());

export default app;


