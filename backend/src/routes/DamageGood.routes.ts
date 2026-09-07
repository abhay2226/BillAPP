import { Router } from "express";

import {
    createDamagedGoods,
    getAllDamagedGoods,
    getDamagedGoodsById,
    getDamagedGoodsByInventory,
    updateDamagedGoods,
    deactivateDamagedGoods
} from "../controller/DamageGoodsControllerf.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";


const DamageGoodsRouter = Router();
DamageGoodsRouter.use(authenticate);

DamageGoodsRouter.post(
    "/",
    authorize("OWNER", "STAFF"),
    createDamagedGoods
);

DamageGoodsRouter.get(
    "/",
    authorize("OWNER",  "STAFF"),
    requireStoreAccess("params", "storeId"),
    getAllDamagedGoods
);

DamageGoodsRouter.get(
    "/inventory/:inventoryId",
    authorize("OWNER", "STAFF"),
    requireStoreAccess("params", "storeId"),
    getDamagedGoodsByInventory
);

DamageGoodsRouter.get(
    "/:id",
    authorize("OWNER", "STAFF"),
    getDamagedGoodsById
);

DamageGoodsRouter.put(
    "/:id",
    authorize("OWNER","STAFF"),
    requireStoreAccess("params", "storeId"),
    updateDamagedGoods
);

DamageGoodsRouter.patch(
    "/deactivate/:id",
    authorize("OWNER",  "STAFF"),
    requireStoreAccess("params", "storeId"),
    deactivateDamagedGoods
);

export default DamageGoodsRouter;