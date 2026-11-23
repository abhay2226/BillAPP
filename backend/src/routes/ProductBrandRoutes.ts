import { Router } from "express";

import {
    deactivateProductBrandController,
    getAllProductBrandsController
} from "../controller/ProductBrandController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";


const ProductBrandRouter =
    Router();


ProductBrandRouter.use(
    authenticate
);


ProductBrandRouter.get(
    "/",
    authorize("OWNER", "STAFF"),
    getAllProductBrandsController
);

ProductBrandRouter.delete(
    "/:id",
    authorize("OWNER", "STAFF"),
    deactivateProductBrandController
);


export default ProductBrandRouter;