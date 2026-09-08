import type { Request, Response } from "express";


import {
    getRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
} from "../services/Role.js";



// ======================================================
// GET ALL ACTIVE ROLES
// ======================================================

export async function getRolesController(
    req: Request,
    res: Response
) {

    try {
        const roles = await getRoles();

        return res.status(200).json({
            success: true,
            data: roles
        });

    } catch (error) {

        console.error("Get roles error:", error);

        const status =
            (error as any)?.status ?? 500;

        return res.status(status).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch roles."
        });
    }
}


// ======================================================
// GET ROLE BY ID
// ======================================================

export async function getRoleByIdController(
    req: Request,
    res: Response
) {

    try {

        const roleId = Number(req.params.id);

        const role = await getRoleById(roleId);

        return res.status(200).json({
            success: true,
            data: role
        });

    } catch (error) {

        console.error("Get role error:", error);

        const status =
            (error as any)?.status ?? 404;

        return res.status(status).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch role."
        });
    }
}


// ======================================================
// CREATE ROLE
// ======================================================

export async function createRoleController(
    req: Request,
    res: Response
) {

    try {

        const { userId, storeId, sessionId } = req.auth;

        const role = await createRole(
            req.body,
            {
                userId,
                storeId,
                sessionId
            }
        );

        return res.status(201).json({
            success: true,
            message: "Role created.",
            data: role
        });

    } catch (error) {

        console.error("Create role error:", error);

        const status =
            (error as any)?.status ?? 400;

        return res.status(status).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create role."
        });
    }
}


// ======================================================
// UPDATE ROLE
// ======================================================

export async function updateRoleController(
    req: Request,
    res: Response
) {

    try {

        const roleId = Number(req.params.id);
        const { userId, storeId, sessionId } = req.auth;

        const role = await updateRole(
            roleId,
            req.body,
            {
                userId,
                storeId,
                sessionId
            }
        );

        return res.status(200).json({
            success: true,
            message: "Role updated.",
            data: role
        });

    } catch (error) {

        console.error("Update role error:", error);

        const status =
            (error as any)?.status ?? 400;

        return res.status(status).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update role."
        });
    }
}


// ======================================================
// DELETE / DEACTIVATE ROLE
// ======================================================

export async function deleteRoleController(
    req:Request,
    res: Response
) {

    try {
        const roleId = Number(req.params.id);
        const { userId, storeId, sessionId } = req.auth;

        const role = await deleteRole(
            roleId,
            {
                userId,
                storeId,
                sessionId
            }
        );

        return res.status(200).json({
            success: true,
            message: "Role deactivated.",
            data: role
        });

    } catch (error) {

        console.error("Delete role error:", error);

        const status =
            (error as any)?.status ?? 400;

        return res.status(status).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to deactivate role."
        });
    }
}