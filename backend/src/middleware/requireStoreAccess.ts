import type { Request, Response, NextFunction } from "express";

export function requireStoreAccess(
  storeIdSource: "params" | "body" = "params",
  fieldName = "storeId"
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({
        success: false,
        message: "Authentication is required."
      });
      return;
    }

    const rawStoreId =
      storeIdSource === "params"
        ? req.params[fieldName]
        : req.body[fieldName];

    const requestedStoreId = Number(rawStoreId);

    if (!Number.isInteger(requestedStoreId) || requestedStoreId <= 0) {
      res.status(400).json({
        success: false,
        message: "A valid store ID is required."
      });
      return;
    }

    if (requestedStoreId !== req.auth.storeId) {
      res.status(403).json({
        success: false,
        message: "You cannot access resources from another store."
      });
      return;
    }

    next();
  };
}