import "reflect-metadata";

import { DataSource } from "typeorm";

import { User } from "../entities/User.js";
import { Role } from "../entities/Role.js";
import { Store } from "../entities/Store.js";
import { Session } from "../entities/Session.js";

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
