// import { Router } from "express";

// import {
//     updateStoreController,
//     deleteStoreController
// } from "../controller/StoreController.js";

// const StoreRouter = Router();

// StoreRouter.patch("/:id", updateStoreController);
// StoreRouter.delete("/:id", deleteStoreController);

// export default StoreRouter;


import { Router } from "express";
import {
  getStoresController,
  getStoresByIdController,
  updateStoreController,
  deleteStoreController
} from "../controller/StoreController.js";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";

const router = Router();

// All store management routes require authentication
router.use(authenticate);

// List all stores (can be public or authenticated; here authenticated)
router.get("/", authorize("OWNER", "ADMIN", "STAFF"), getStoresController);

// Get single store
router.get(
  "/:id",
  authorize("OWNER", "ADMIN", "STAFF"),
  requireStoreAccess("params", "id"),
  getStoresByIdController
);

// Update store – only OWNER of that store
router.put(
  "/:id",
  authorize("OWNER"),
  requireStoreAccess("params", "id"),
  updateStoreController
);

// Delete/deactivate store – only OWNER of that store
router.delete(
  "/:id",
  authorize("OWNER"),
  requireStoreAccess("params", "id"),
  deleteStoreController
);

export default router;