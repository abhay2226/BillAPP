import type { Request, Response } from "express";

import {
    createAuditService,
    getAllAuditsService,
    getAuditByIdService,
    getAuditsByTableNameService,
    getAuditsByRecordIdService,
    getAuditsByTableAndRecordIdService,
    getAuditsByStoreService,
    getAuditsByUserService,
    getAuditsBySessionService,
    getAuditsByActionTypeService
} from "../services/AuditServices.js";



// CREATE AUDIT RECORD

export const createAuditController = async (
    req: Request,
    res: Response
) => {

    try {

        const audit = await createAuditService(
            req.body
        );

        return res.status(201).json({

            message: "Audit record created successfully",

            data: audit

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to create audit record"

        });

    }
};



// GET ALL AUDIT RECORDS

export const getAllAuditsController = async (
    req: Request,
    res: Response
) => {

    try {

        const audits = await getAllAuditsService();

        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};



// GET AUDIT BY ID

export const getAuditByIdController = async (
    req: Request,
    res: Response
) => {

    try {

        const auditId = Number(
            req.params.id
        );


        if (
            !Number.isInteger(auditId) ||
            auditId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid audit ID"

            });

        }


        const audit =
            await getAuditByIdService(
                auditId
            );


        if (!audit) {

            return res.status(404).json({

                message: "Audit record not found"

            });

        }


        return res.status(200).json({

            message: "Audit record fetched successfully",

            data: audit

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit record"

        });

    }
};



// GET AUDITS BY TABLE NAME

export const getAuditsByTableNameController = async (
    req: Request,
    res: Response
) => {

    try {

        const tableName =
            String(req.params.tableName);


        if (!tableName.trim()) {

            return res.status(400).json({

                message: "Table name is required"

            });

        }


        const audits =
            await getAuditsByTableNameService(
                tableName
            );


        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};



// GET AUDITS BY RECORD ID

export const getAuditsByRecordIdController = async (
    req: Request,
    res: Response
) => {

    try {

        const recordId = Number(
            req.params.recordId
        );


        if (
            !Number.isInteger(recordId) ||
            recordId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid record ID"

            });

        }


        const audits =
            await getAuditsByRecordIdService(
                recordId
            );


        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};



// GET AUDITS BY TABLE NAME + RECORD ID

export const getAuditsByTableAndRecordIdController = async (
    req: Request,
    res: Response
) => {

    try {

        const tableName = String(
            req.params.tableName
        );

        const recordId = Number(
            req.params.recordId
        );

        if (!tableName.trim()) {

            return res.status(400).json({

                message: "Table name is required"

            });

        }

        if (
            !Number.isInteger(recordId) ||
            recordId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid record ID"

            });

        }

        const audits =
            await getAuditsByTableAndRecordIdService(
                tableName,
                recordId
            );

        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};



// GET AUDITS BY STORE

export const getAuditsByStoreController = async (
    req: Request,
    res: Response
) => {

    try {

        const storeId = Number(
            req.params.storeId
        );


        if (
            !Number.isInteger(storeId) ||
            storeId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid store ID"

            });

        }


        const audits =
            await getAuditsByStoreService(
                storeId
            );


        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};



// GET AUDITS BY USER

export const getAuditsByUserController = async (
    req: Request,
    res: Response
) => {

    try {

        const userId = Number(
            req.params.userId
        );


        if (
            !Number.isInteger(userId) ||
            userId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid user ID"

            });

        }


        const audits =
            await getAuditsByUserService(
                userId
            );


        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};



// GET AUDITS BY SESSION

export const getAuditsBySessionController = async (
    req: Request,
    res: Response
) => {

    try {

        const sessionId = Number(
            req.params.sessionId
        );


        if (
            !Number.isInteger(sessionId) ||
            sessionId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid session ID"

            });

        }


        const audits =
            await getAuditsBySessionService(
                sessionId
            );


        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};



// GET AUDITS BY ACTION TYPE

export const getAuditsByActionTypeController = async (
    req: Request,
    res: Response
) => {

    try {

        const actionTypeId = Number(
            req.params.actionTypeId
        );


        if (
            !Number.isInteger(actionTypeId) ||
            actionTypeId <= 0
        ) {

            return res.status(400).json({

                message: "Invalid action type ID"

            });

        }


        const audits =
            await getAuditsByActionTypeService(
                actionTypeId
            );


        return res.status(200).json({

            message: "Audit records fetched successfully",

            data: audits

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            message: "Failed to fetch audit records"

        });

    }
};