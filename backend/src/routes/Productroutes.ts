import { Router } from "express";

import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController
} from "../controller/ProductController.js";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";

const ProductRouter = Router();
ProductRouter.use(authenticate);

// PRODUCT ROUTES


ProductRouter.get("/",authorize("OWNER", "STAFF"), getAllProductsController);

ProductRouter.get("/:id",authorize("OWNER", "STAFF"), getProductByIdController);

ProductRouter.post("/",authorize("OWNER"), createProductController);

ProductRouter.put("/:id",authorize("OWNER"), updateProductController);

ProductRouter.delete("/:id",authorize("OWNER"), deleteProductController);


export default ProductRouter;