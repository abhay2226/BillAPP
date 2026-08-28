import "reflect-metadata";
import express from "express";

import Router from "express";
import { AppDataSource } from "./config/datasource.js";
import { User } from "./entity/TransactionsUser.js";

const userRouter = Router();

const userRepository = AppDataSource.getRepository(User);

// speciesRouter.get("/", (req , res) => {

//     res.json({
//         message: "Species route working"
//     });

// });

//imports fr routes


//express app
const app= express();
app.use(express.json());

export default app;


