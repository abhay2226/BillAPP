import { Router } from "express";

import {
    getAllProductTypesController
} from "../controller/ProductTypeController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";


const ProductTypeRouter =
    Router();


ProductTypeRouter.use(
    authenticate
);


ProductTypeRouter.get(
    "/",
    authorize("OWNER", "STAFF"),
    getAllProductTypesController
);


export default ProductTypeRouter;