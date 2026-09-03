import { AppDataSource } from "../datasource.js";
import { Audit } from "../entity/TransactionsAudit.js";

const auditRepository = AppDataSource.getRepository(Audit);


// CREATE AUDIT RECORD

export const createAuditService = async (
    auditData: Partial<Audit>
) => {

    if (!auditData.table_name) {
        throw new Error("Table name is required");
    }

    if (
        !auditData.record_id ||
        auditData.record_id <= 0
    ) {
        throw new Error("Valid record ID is required");
    }

    if (!auditData.action_type) {
        throw new Error("Action type is required");
    }

    if (
        !auditData.updated_by ||
        auditData.updated_by <= 0
    ) {
        throw new Error("Valid updated_by is required");
    }

    if (
        !auditData.store_id ||
        auditData.store_id <= 0
    ) {
        throw new Error("Valid store ID is required");
    }

    if (
        !auditData.session_id ||
        auditData.session_id <= 0
    ) {
        throw new Error("Valid session ID is required");
    }


    const audit = auditRepository.create({

        table_name: auditData.table_name.trim(),

        record_id: auditData.record_id,

        action_type: auditData.action_type
            .trim()
            .toUpperCase(),

        updated_by: auditData.updated_by,

        updated_at: new Date(),

        store_id: auditData.store_id,

        session_id: auditData.session_id,

        ip_address:
            auditData.ip_address || null,

        is_active: true

    });


    return await auditRepository.save(audit);
};



// GET ALL AUDIT RECORDS

export const getAllAuditsService = async () => {

    return await auditRepository.find({

        where: {
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};



// GET AUDIT BY ID

export const getAuditByIdService = async (
    auditId: number
) => {

    return await auditRepository.findOne({

        where: {
            audit_id: auditId,
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ]

    });
};



// GET AUDITS BY TABLE NAME

export const getAuditsByTableNameService = async (
    tableName: string
) => {

    return await auditRepository.find({

        where: {
            table_name: tableName,
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};



// GET AUDITS BY RECORD ID

export const getAuditsByRecordIdService = async (
    recordId: number
) => {

    return await auditRepository.find({

        where: {
            record_id: recordId,
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};



// GET AUDITS BY TABLE NAME + RECORD ID

export const getAuditsByTableAndRecordIdService = async (
    tableName: string,
    recordId: number
) => {

    return await auditRepository.find({

        where: {
            table_name: tableName,
            record_id: recordId,
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};



// GET AUDITS BY STORE

export const getAuditsByStoreService = async (
    storeId: number
) => {

    return await auditRepository.find({

        where: {
            store_id: storeId,
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};



// GET AUDITS BY USER

export const getAuditsByUserService = async (
    userId: number
) => {

    return await auditRepository.find({

        where: {
            updated_by: userId,
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};



// GET AUDITS BY SESSION

export const getAuditsBySessionService = async (
    sessionId: number
) => {

    return await auditRepository.find({

        where: {
            session_id: sessionId,
            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};



// GET AUDITS BY ACTION TYPE

export const getAuditsByActionTypeService = async (
    actionType: string
) => {

    return await auditRepository.find({

        where: {
            action_type: actionType
                .trim()
                .toUpperCase(),

            is_active: true
        },

        relations: [
            "updatedBy",
            "store",
            "session"
        ],

        order: {
            audit_id: "DESC"
        }

    });
};