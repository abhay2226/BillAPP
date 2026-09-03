import { Router } from "express";

import {
    getUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController
} from "../controller/UserController.js";

const router = Router();

router.get("/", getUsersController);
router.get("/:userId", getUserByIdController);
router.put("/:userId", updateUserController);
router.patch("/:userId/deactivate", deleteUserController);

export default router;