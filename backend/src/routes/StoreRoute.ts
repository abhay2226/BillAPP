import { Router } from "express";

import {
    updateStoreController,
    deleteStoreController
} from "../controller/StoreController.js";

const StoreRouter = Router();

StoreRouter.patch("/:id", updateStoreController);
StoreRouter.delete("/:id", deleteStoreController);

export default StoreRouter;