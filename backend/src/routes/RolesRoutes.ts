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

roleRouter.get("/",authorize("OWNER", "ADMIN", "STAFF"), getRolesController);
roleRouter.get("/:id",authorize("OWNER", "ADMIN", "STAFF"), getRoleByIdController);
roleRouter.post("/",authorize("ADMIN"), createRoleController);
roleRouter.patch("/:id",authorize("ADMIN"), updateRoleController);
roleRouter.delete("/:id",authorize("ADMIN"), deleteRoleController);

export default roleRouter;