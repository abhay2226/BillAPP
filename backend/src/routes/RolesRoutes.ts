import { Router } from "express";
import {
  getRolesController,
  getRoleByIdController,
  createRoleController,
  updateRoleController,
  deleteRoleController,
} from "../controller/RolesController.js";
import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";

const roleRouter = Router();
roleRouter.use(authenticate);

roleRouter.get("/",authorize("OWNER", "STAFF"), getRolesController);
roleRouter.get("/:id",authorize("OWNER", "STAFF"), getRoleByIdController);
roleRouter.post("/",authorize("OWNER"), createRoleController);
roleRouter.patch("/:id",authorize("OWNER"), updateRoleController);
roleRouter.delete("/:id",authorize("OWNER"), deleteRoleController);

export default roleRouter;