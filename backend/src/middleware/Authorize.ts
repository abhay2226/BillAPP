import type { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../datasource.js";
import { Role } from "../entity/MasterRole.js";

export function authorize(...allowedRoles: string[]) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.auth) {
        res.status(401).json({
          success: false,
          message: "Authentication is required."
        });
        return;
      }

      const roleRepo = AppDataSource.getRepository(Role);

      const role = await roleRepo.findOne({
        where: {
          role_id: req.auth.roleId,
          is_active: true
        }
      });

      if (!role) {
        res.status(403).json({
          success: false,
          message: "Your role is inactive or unavailable."
        });
        return;
      }

      const currentRole = role.role_name.trim().toUpperCase();

      const canAccess = allowedRoles
        .map((item) => item.toUpperCase())
        .includes(currentRole);

      if (!canAccess) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to perform this action."
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Authorization failed."
      });
    }
  };
}