import { Router } from "express";

import {
    deactivateProductTypeController,
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

ProductTypeRouter.delete(
    "/:id",
    authorize("OWNER", "STAFF"),
    deactivateProductTypeController
);


export default ProductTypeRouter;