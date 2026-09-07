
import { AppDataSource } from "../datasource.js";

import { Audit } from "../entity/TransactionsAudit.js";
import { ActionType } from "../entity/MasterActionType.js";

import { EntityManager } from "typeorm";


// ======================================================
// REPOSITORIES
// ======================================================

const auditRepository =
    AppDataSource.getRepository(Audit);

const actionTypeRepository =
    AppDataSource.getRepository(ActionType);


// ======================================================
// VALIDATE ID
// ======================================================

const validateId = (
    value: number,
    message: string
): void => {

    if (
        !Number.isInteger(value) ||
        value <= 0
    ) {
        throw new Error(message);
    }
};


// ======================================================
// GET ACTION TYPE BY NAME
// ======================================================

const getActionType = async (
    manager: EntityManager,
    actionTypeName: string
): Promise<ActionType> => {

    if (
        !actionTypeName ||
        !actionTypeName.trim()
    ) {
        throw new Error(
            "Action type name is required"
        );
    }


    const normalizedName =
        actionTypeName
            .trim()
            .toUpperCase();


    const actionType =
        await manager.findOne(
            ActionType,
            {
                where: {
                    code:
                        normalizedName,

                    is_active:
                        true
                }
            }
        );


    if (!actionType) {

        throw new Error(
            `Action type '${normalizedName}' not found or inactive`
        );
    }


    return actionType;
};


// ======================================================
// CREATE AUDIT RECORD FOR EACH TABLE CRUD
// ======================================================

export const createAuditRecordService = async (
    manager: EntityManager,

    data: {
        tableName: string;
        recordId: number;
        actionTypeName: string;
        userId: number;
        storeId: number;
        sessionId: number;
        ipAddress?: string | null;
    }
): Promise<Audit> => {


    // ==================================================
    // VALIDATE DATA
    // ==================================================

    if (!data.tableName?.trim()) {

        throw new Error(
            "Table name is required"
        );
    }


    validateId(
        data.recordId,
        "Valid record ID is required"
    );


    validateId(
        data.userId,
        "Valid user ID is required"
    );


    validateId(
        data.storeId,
        "Valid store ID is required"
    );


    validateId(
        data.sessionId,
        "Valid session ID is required"
    );


    if (
        !data.actionTypeName ||
        !data.actionTypeName.trim()
    ) {

        throw new Error(
            "Action type name is required"
        );
    }


    // ==================================================
    // GET ACTION TYPE BY NAME
    // ==================================================

    const actionType =
        await getActionType(
            manager,
            data.actionTypeName
        );


    // ==================================================
    // CREATE AUDIT
    // ==================================================

    const audit =
        manager.create(
            Audit,
            {

                table_name:
                    data.tableName.trim(),

                record_id:
                    data.recordId,

                action_type_id:
                    actionType.action_type_id,

                action_type:
                    actionType,

                store_id:
                    data.storeId,

                session_id:
                    data.sessionId,

                ip_address:
                    data.ipAddress ?? null,

                is_active:
                    true
            }
        );


    // ==================================================
    // SAVE AUDIT
    // ==================================================

    return await manager.save(
        Audit,
        audit
    );
};


// ======================================================
// CREATE AUDIT RECORD
// ======================================================

export const createAuditService = async (
    auditData: Partial<Audit> & {
        actionTypeName?: string;
        userId?: number;
    }
) => {


    // ==================================================
    // TABLE NAME
    // ==================================================

    if (!auditData.table_name?.trim()) {

        throw new Error(
            "Table name is required"
        );
    }


    // ==================================================
    // RECORD ID
    // ==================================================

    if (
        auditData.record_id === undefined ||
        auditData.record_id === null ||
        auditData.record_id <= 0
    ) {

        throw new Error(
            "Valid record ID is required"
        );
    }


    // ==================================================
    // ACTION TYPE NAME
    // ==================================================

    if (
        !auditData.actionTypeName ||
        !auditData.actionTypeName.trim()
    ) {

        throw new Error(
            "Action type name is required"
        );
    }


    // ==================================================
    // STORE ID
    // ==================================================

    if (
        auditData.store_id === undefined ||
        auditData.store_id === null ||
        auditData.store_id <= 0
    ) {

        throw new Error(
            "Valid store ID is required"
        );
    }


    // ==================================================
    // SESSION ID
    // ==================================================

    if (
        auditData.session_id === undefined ||
        auditData.session_id === null ||
        auditData.session_id <= 0
    ) {

        throw new Error(
            "Valid session ID is required"
        );
    }


    // ==================================================
    // GET ACTION TYPE BY NAME
    // ==================================================

    const normalizedName =
        auditData.actionTypeName
            .trim()
            .toUpperCase();


    const actionType =
        await actionTypeRepository.findOne({

            where: {

                code:
                    normalizedName,

                is_active:
                    true
            }
        });


    if (!actionType) {

        throw new Error(
            `Action type '${normalizedName}' not found or inactive`
        );
    }


    // ==================================================
    // CREATE AUDIT
    // ==================================================

    const audit =
        auditRepository.create({

            table_name:
                auditData.table_name.trim(),

            record_id:
                auditData.record_id,

            action_type_id:
                actionType.action_type_id,

            action_type:
                actionType,

            store_id:
                auditData.store_id,

            session_id:
                auditData.session_id,

            ip_address:
                auditData.ip_address ?? null,

            is_active:
                true
        });


    // ==================================================
    // SAVE AUDIT
    // ==================================================

    return await auditRepository.save(
        audit
    );
};


// ======================================================
// GET ALL AUDIT RECORDS
// ======================================================

export const getAllAuditsService = async () => {

    return await auditRepository.find({

        where: {
            is_active: true
        },

        relations: {
            action_type: true,
            store: true,
            session: true
        },

        order: {
            audit_id: "DESC"
        }
    });
};


// ======================================================
// GET AUDIT BY ID
// ======================================================

export const getAuditByIdService = async (
    auditId: number
) => {

    validateId(
        auditId,
        "Valid audit ID is required"
    );


    return await auditRepository.findOne({

        where: {
            audit_id: auditId,

            is_active:
                true
        },

        relations: {
            action_type: true,
            store: true,
            session: true
        }
    });
};


// ======================================================
// GET AUDITS BY TABLE NAME
// ======================================================

export const getAuditsByTableNameService =
    async (
        tableName: string
    ) => {

        if (
            !tableName ||
            !tableName.trim()
        ) {

            throw new Error(
                "Table name is required"
            );
        }


        return await auditRepository.find({

            where: {
                table_name:
                    tableName.trim(),

                is_active:
                    true
            },

            relations: {
                action_type: true,
                store: true,
                session: true
            },

            order: {
                audit_id:
                    "DESC"
            }
        });
    };


// ======================================================
// GET AUDITS BY RECORD ID
// ======================================================

export const getAuditsByRecordIdService =
    async (
        recordId: number
    ) => {

        validateId(
            recordId,
            "Valid record ID is required"
        );


        return await auditRepository.find({

            where: {
                record_id:
                    recordId,

                is_active:
                    true
            },

            relations: {
                action_type: true,
                store: true,
                session: true
            },

            order: {
                audit_id:
                    "DESC"
            }
        });
    };


// ======================================================
// GET AUDITS BY TABLE NAME + RECORD ID
// ======================================================

export const getAuditsByTableAndRecordIdService =
    async (
        tableName: string,
        recordId: number
    ) => {

        if (
            !tableName ||
            !tableName.trim()
        ) {

            throw new Error(
                "Table name is required"
            );
        }


        validateId(
            recordId,
            "Valid record ID is required"
        );


        return await auditRepository.find({

            where: {
                table_name:
                    tableName.trim(),

                record_id:
                    recordId,

                is_active:
                    true
            },

            relations: {
                action_type: true,
                store: true,
                session: true
            },

            order: {
                audit_id:
                    "DESC"
            }
        });
    };


// ======================================================
// GET AUDITS BY STORE
// ======================================================

export const getAuditsByStoreService =
    async (
        storeId: number
    ) => {

        validateId(
            storeId,
            "Valid store ID is required"
        );


        return await auditRepository.find({

            where: {
                store_id:
                    storeId,

                is_active:
                    true
            },

            relations: {
                action_type: true,
                store: true,
                session: true
            },

            order: {
                audit_id:
                    "DESC"
            }
        });
    };


// ======================================================
// GET AUDITS BY SESSION
// ======================================================

export const getAuditsBySessionService =
    async (
        sessionId: number
    ) => {

        validateId(
            sessionId,
            "Valid session ID is required"
        );


        return await auditRepository.find({

            where: {
                session_id:
                    sessionId,

                is_active:
                    true
            },

            relations: {
                action_type: true,
                store: true,
                session: true
            },

            order: {
                audit_id:
                    "DESC"
            }
        });
    };


// ======================================================
// GET AUDITS BY ACTION TYPE NAME
// ======================================================

export const getAuditsByActionTypeService =
    async (
        actionTypeName: string
    ) => {

        if (
            !actionTypeName ||
            !actionTypeName.trim()
        ) {

            throw new Error(
                "Action type name is required"
            );
        }


        const normalizedName =
            actionTypeName
                .trim()
                .toUpperCase();


        const actionType =
            await actionTypeRepository.findOne({

                where: {

                    code:
                        normalizedName,

                    is_active:
                        true
                }
            });


        if (!actionType) {

            throw new Error(
                `Action type '${normalizedName}' not found or inactive`
            );
        }


        return await auditRepository.find({

            where: {

                action_type_id:
                    actionType.action_type_id,

                is_active:
                    true
            },

            relations: {
                action_type: true,
                store: true,
                session: true
            },

            order: {
                audit_id:
                    "DESC"
            }
        });
    };


// ======================================================
// DEACTIVATE AUDIT RECORD
// ======================================================

export const deactivateAuditService =
    async (
        auditId: number
    ) => {

        validateId(
            auditId,
            "Valid audit ID is required"
        );


        const audit =
            await auditRepository.findOne({

                where: {
                    audit_id:
                        auditId,

                    is_active:
                        true
                }
            });


        if (!audit) {

            throw new Error(
                "Audit record not found"
            );
        }


        audit.is_active =
            false;


        return await auditRepository.save(
            audit
        );
    };
