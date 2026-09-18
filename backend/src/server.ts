import "dotenv/config";
import app from "./app.js";

import { AppDataSource } from "./datasource.js";
import { Session } from "./entity/TransactionsSession.js";


const PORT = Number(process.env.PORT) || 5000;

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");

        // Force every client to log in again on each server restart —
        // any session/token issued before this boot is no longer valid.
        await AppDataSource
            .getRepository(Session)
            .createQueryBuilder()
            .update(Session)
            .set({
                is_active: false,
                logout_at: new Date()
            })
            .where("is_active = :isActive", { isActive: true })
            .execute();

        console.log("All previous sessions invalidated — clients must log in again.");

        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    })

    .catch((err) => {
        console.error("Error during Data Source initialization:",err);
    })
