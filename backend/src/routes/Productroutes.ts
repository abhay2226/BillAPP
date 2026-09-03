import { Router } from "express";

import {
    createProductController,
    getAllProductsController,
    getProductByIdController,
    updateProductController,
    deleteProductController
} from "../controller/ProductController.js";

const ProductRouter = Router();


// PRODUCT ROUTES



ProductRouter.post("/", createProductController);

ProductRouter.get("/", getAllProductsController);

ProductRouter.get("/:id", getProductByIdController);

ProductRouter.put("/:id", updateProductController);

ProductRouter.delete("/:id", deleteProductController);


export default ProductRouter;