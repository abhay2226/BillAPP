import { Router } from "express";

import {
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController
} from "../controller/UserController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";

const router = Router();

router.use(authenticate);

router.get("/",authorize("OWNER", "ADMIN"), getUsersController);
router.get("/:userId",authorize("OWNER", "ADMIN","STAFF"), getUserByIdController);
router.put("/:userId",authorize("OWNER", "ADMIN","STAFF"),updateUserController);
router.patch("/:userId/deactivate",authorize("OWNER"), deleteUserController);

export default router;