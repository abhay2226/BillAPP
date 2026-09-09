import { Router } from "express";

import {
    getUsersController,
    getUserByIdController,
    createUserController,
    updateUserController,
    deleteUserController,
    restoreUserController
} from "../controller/UserController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";

const router = Router();

router.use(authenticate);

router.get("/", authorize("OWNER"), getUsersController);
router.post("/", authorize("OWNER"), createUserController);
router.get("/:userId", authorize("OWNER", "STAFF"), getUserByIdController);
router.put("/:userId", authorize("OWNER", "STAFF"), updateUserController);
router.patch("/:userId/deactivate", authorize("OWNER"), deleteUserController);
router.post("/:userId/restore", authorize("OWNER"), restoreUserController);
router.patch("/:userId/restore", authorize("OWNER"), restoreUserController);

export default router;