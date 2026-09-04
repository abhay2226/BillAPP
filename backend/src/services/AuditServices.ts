
import { AppDataSource } from "../datasource.js";

import { Audit } from "../entity/TransactionsAudit.js";
import { ActionType } from "../entity/MasterActionType.js";

const auditRepository =
    AppDataSource.getRepository(Audit);

const actionTypeRepository =
    AppDataSource.getRepository(ActionType);


// ======================================================
// CREATE AUDIT RECORD
// ======================================================

export const createAuditService = async (
    auditData: Partial<Audit>
) => {

    // TABLE NAME
    if (!auditData.table_name?.trim()) {
        throw new Error("Table name is required");
    }


    // RECORD ID
    if (
        auditData.record_id === undefined ||
        auditData.record_id === null ||
        auditData.record_id <= 0
    ) {
        throw new Error("Valid record ID is required");
    }


    // ACTION TYPE ID
    if (
        auditData.action_type_id === undefined ||
        auditData.action_type_id === null ||
        auditData.action_type_id <= 0
    ) {
        throw new Error("Valid action type ID is required");
    }


    // STORE ID
    if (
        auditData.store_id === undefined ||
        auditData.store_id === null ||
        auditData.store_id <= 0
    ) {
        throw new Error("Valid store ID is required");
    }


    // SESSION ID
    if (
        auditData.session_id === undefined ||
        auditData.session_id === null ||
        auditData.session_id <= 0
    ) {
        throw new Error("Valid session ID is required");
    }


    // CHECK ACTION TYPE EXISTS
    const actionType =
        await actionTypeRepository.findOne({
            where: {
                action_type_id:
                    auditData.action_type_id,
                is_active: true
            }
        });


    if (!actionType) {
        throw new Error(
            "Action type not found or inactive"
        );
    }


    // CREATE AUDIT
    const audit =
        auditRepository.create({

            table_name:
                auditData.table_name.trim(),

            record_id:
                auditData.record_id,

            action_type_id:
                auditData.action_type_id,

            store_id:
                auditData.store_id,

            session_id:
                auditData.session_id,

            ip_address:
                auditData.ip_address ?? null,

            is_active:
                true
        });


    return await auditRepository.save(audit);
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

    return await auditRepository.findOne({

        where: {
            audit_id: auditId,
            is_active: true
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

export const getAuditsByTableNameService = async (
    tableName: string
) => {

    return await auditRepository.find({

        where: {
            table_name: tableName.trim(),
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
// GET AUDITS BY RECORD ID
// ======================================================

export const getAuditsByRecordIdService = async (
    recordId: number
) => {

    return await auditRepository.find({

        where: {
            record_id: recordId,
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
// GET AUDITS BY TABLE NAME + RECORD ID
// ======================================================

export const getAuditsByTableAndRecordIdService = async (
    tableName: string,
    recordId: number
) => {

    return await auditRepository.find({

        where: {
            table_name: tableName.trim(),
            record_id: recordId,
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
// GET AUDITS BY STORE
// ======================================================

export const getAuditsByStoreService = async (
    storeId: number
) => {

    return await auditRepository.find({

        where: {
            store_id: storeId,
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
// GET AUDITS BY SESSION
// ======================================================

export const getAuditsBySessionService = async (
    sessionId: number
) => {

    return await auditRepository.find({

        where: {
            session_id: sessionId,
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
// GET AUDITS BY ACTION TYPE
// ======================================================

export const getAuditsByActionTypeService = async (
    actionTypeId: number
) => {

    return await auditRepository.find({

        where: {
            action_type_id: actionTypeId,
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
// DEACTIVATE AUDIT RECORD
// ======================================================

export const deactivateAuditService = async (
    auditId: number
) => {

    const audit =
        await auditRepository.findOne({

            where: {
                audit_id: auditId,
                is_active: true
            }
        });


    if (!audit) {
        throw new Error(
            "Audit record not found"
        );
    }


    audit.is_active = false;


    return await auditRepository.save(audit);
};
