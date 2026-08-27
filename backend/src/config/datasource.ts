import "reflect-metadata";

import { DataSource } from "typeorm";

import { User } from "../entity/TransactionsUser.js";
import { Role } from "../entity/MasterRole.js";
import { Store } from "../entity/TransactionsStore.js";
import { Session } from "../entity/TransactionsSession.js";

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
