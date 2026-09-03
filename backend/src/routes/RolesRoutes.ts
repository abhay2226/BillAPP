import { Router } from "express";
import {
  getRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
} from "../controller/RolesController.js";

const roleRouter = Router();

roleRouter.get("/", getRolesController);
roleRouter.get("/:id", getRoleByIdController);
roleRouter.post("/", createRoleController);
roleRouter.patch("/:id", updateRoleController);
roleRouter.delete("/:id", deleteRoleController);

export default roleRouter;