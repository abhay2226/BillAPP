import "reflect-metadata";

import { DataSource } from "typeorm";

import { User } from "../entity/User.js";
import { Role } from "../entity/Role.js";
import { Store } from "../entity/Store.js";
import { Session } from "../entity/Session.js";

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
