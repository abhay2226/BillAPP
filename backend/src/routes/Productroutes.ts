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


ProductRouter.get("/",authorize("OWNER", "ADMIN", "STAFF"), getAllProductsController);

ProductRouter.get("/:id",authorize("OWNER", "ADMIN", "STAFF"), getProductByIdController);

ProductRouter.post("/",authorize("OWNER", "ADMIN"), createProductController);

ProductRouter.put("/:id",authorize("OWNER", "ADMIN"), updateProductController);

ProductRouter.delete("/:id",authorize("OWNER", "ADMIN"), deleteProductController);


export default ProductRouter;