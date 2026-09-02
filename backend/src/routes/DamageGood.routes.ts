import { Router } from "express";

import {
    createDamagedGoods,
    getAllDamagedGoods,
    getDamagedGoodsById,
    getDamagedGoodsByInventory,
    updateDamagedGoods,
    deactivateDamagedGoods
} from "../controller/DamageGoodsControllerf.js";

const DamageGoodsRouter = Router();

DamageGoodsRouter.post(
    "/",
    createDamagedGoods
);

DamageGoodsRouter.get(
    "/",
    getAllDamagedGoods
);

DamageGoodsRouter.get(
    "/inventory/:inventoryId",
    getDamagedGoodsByInventory
);

DamageGoodsRouter.get(
    "/:id",
    getDamagedGoodsById
);

DamageGoodsRouter.put(
    "/:id",
    updateDamagedGoods
);

DamageGoodsRouter.patch(
    "/deactivate/:id",
    deactivateDamagedGoods
);

export default DamageGoodsRouter;