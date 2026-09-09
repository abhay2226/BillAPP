import { Router } from "express";
import {
    getStoresController,
    getStoresByIdController,
    updateStoreController,
    closeStoreController,
    restoreStoreController,
    deleteStoreController
} from "../controller/StoreController.js";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";

const router = Router();

// All store management routes require authentication
router.use(authenticate);

// List all stores
router.get("/", authorize("OWNER", "STAFF"), getStoresController);

// Get single store
router.get(
    "/:id",
    authorize("OWNER", "STAFF"),
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

// Close store – explicit store lifecycle endpoint
router.post(
    "/:id/close",
    authorize("OWNER"),
    requireStoreAccess("params", "id"),
    closeStoreController
);

// Restore store – reactivate store and its associated data
router.post(
    "/:id/restore",
    authorize("OWNER"),
    requireStoreAccess("params", "id"),
    restoreStoreController
);

// Backward-compatible delete route that closes the store
router.delete(
    "/:id",
    authorize("OWNER"),
    requireStoreAccess("params", "id"),
    deleteStoreController
);

export default router;