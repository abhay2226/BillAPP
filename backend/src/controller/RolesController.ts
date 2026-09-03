import type { Request, Response } from "express";
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from "../services/Role.js";

export async function getRolesController(req: Request, res: Response) {
  try {
    const roles = await getRoles();
    return res.status(200).json({ success: true, data: roles });
  } catch (error) {
    console.error("Get roles error:", error);
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch roles." });
  }
}

export async function getRoleByIdController(req: Request, res: Response) {
  try {
    const role = await getRoleById(Number(req.params.id));
    return res.status(200).json({ success: true, data: role });
  } catch (error) {
    console.error("Get role error:", error);
    return res.status(404).json({ success: false, message: error instanceof Error ? error.message : "Failed to fetch role." });
  }
}

export async function createRoleController(req: Request, res: Response) {
  try {
    const role = await createRole(req.body);
    return res.status(201).json({ success: true, message: "Role created.", data: role });
  } catch (error) {
    console.error("Create role error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to create role." });
  }
}

export async function updateRoleController(req: Request, res: Response) {
  try {
    const role = await updateRole(Number(req.params.id), req.body);
    return res.status(200).json({ success: true, message: "Role updated.", data: role });
  } catch (error) {
    console.error("Update role error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to update role." });
  }
}

export async function deleteRoleController(req: Request, res: Response) {
  try {
    await deleteRole(Number(req.params.id));
    return res.status(200).json({ success: true, message: "Role deactivated." });
  } catch (error) {
    console.error("Delete role error:", error);
    return res.status(400).json({ success: false, message: error instanceof Error ? error.message : "Failed to deactivate role." });
  }
}