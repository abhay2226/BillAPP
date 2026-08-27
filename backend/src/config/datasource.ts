import "reflect-metadata";

import { DataSource } from "typeorm";

import { User } from "../entities/TransactionsUser.js";
import { Role } from "../entities/MasterRole.js";
import { Store } from "../entities/TransactionsStore.js";
import { Session } from "../entities/TransactionsSession.js";

export const AppDataSource = new DataSource({

    type: "sqlite",

    database: "shop_inventory.sqlite",

    synchronize: true,

    logging: false,

    entities: [
        User,
        Role,
        Store,
        Session
    ],

    migrations: [],

    subscribers: []
});
