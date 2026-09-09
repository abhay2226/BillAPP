import { Router } from "express";

import {
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


export default ProductBrandRouter;