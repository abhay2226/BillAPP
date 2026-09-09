import { Router } from "express";

import {
    getAllUnitsController
} from "../controller/UomController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";


const UnitRouter =
    Router();


UnitRouter.use(
    authenticate
);


UnitRouter.get(
    "/",
    authorize("OWNER", "STAFF"),
    getAllUnitsController
);


export default UnitRouter;