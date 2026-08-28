import app from "./app.js";

import { AppDataSource } from "./datasource.js";


const PORT = 5000;

AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");

        app.listen(PORT, () => {
            console.log(`Server is running on ${PORT}`);
        });
    })

    .catch((err) => {
        console.error("Error during Data Source initialization:",err);
    })
