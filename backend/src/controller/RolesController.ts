import type { Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from "../services/Role.js";

// Helper: verify the bearer token and return the decoded payload.
// Throws (with .status = 401) if missing/invalid.
function getAuthUser(req: Request) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    const err: any = new Error("Unauthorized: missing token.");
    err.status = 401;
    throw err;
  }
  return verifyToken(token); // { userId, roleId, storeId, ... }
}

// Helper: require the acting user's role to be OWNER.
// NOTE: confirm the exact field/value your JWT payload uses for role
// (e.g. payload.roleId === 1, or payload.roleName === "OWNER") and adjust below.
function requireOwner(payload: any) {
  const isOwner = payload?.roleName === "OWNER" || payload?.role === "OWNER";
  if (!isOwner) {
    const err: any = new Error("Forbidden: only Owner can manage roles.");
    err.status = 403;
    throw err;
  }
}

export async function getRolesController(req: Request, res: Response) {
  try {
    getAuthUser(req);
    const roles = await getRoles();
    return res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error("Get roles error:", error);
    const status = (error as any)?.status ?? 500;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch roles." });
  }
}

export async function getRoleByIdController(req: Request, res: Response) {
  try {
    getAuthUser(req);
    const role = await getRoleById(Number(req.params.id));
    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error("Get role error:", error);
    const status = (error as any)?.status ?? 404;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch role." });
  }
}

export async function createRoleController(req: Request, res: Response) {
  try {
    const payload = getAuthUser(req);
    requireOwner(payload);
    const role = await createRole(req.body);
    return res.status(201).json({ success: true, message: "Role created.", data: role });
  } catch (error) {
    console.error("Create role error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to create role." });
  }
}

export async function updateRoleController(req: Request, res: Response) {
  try {
    const payload = getAuthUser(req);
    requireOwner(payload);
    const role = await updateRole(Number(req.params.id), req.body);
    return res.status(200).json({ success: true, message: "Role updated.", data: role });
  } catch (error) {
    console.error("Update role error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to update role." });
  }
}

export async function deleteRoleController(req: Request, res: Response) {
  try {
    const payload = getAuthUser(req);
    requireOwner(payload);
    await deleteRole(Number(req.params.id));
    return res.status(200).json({ success: true, message: "Role deactivated." });
  } catch (error) {
    console.error("Delete role error:", error);
    const status = (error as any)?.status ?? 400;
    return res.status(status).json({ success: false, message: error instanceof Error ? error.message : "Failed to deactivate role." });
  }
}