import { Router } from "express";

import {
    createAuditController,
    getAllAuditsController,
    getAuditByIdController,
    getAuditsByTableNameController,
    getAuditsByRecordIdController,
    getAuditsByTableAndRecordIdController,
    getAuditsByStoreController,
    getAuditsByUserController,
    getAuditsBySessionController,
    getAuditsByActionTypeController
} from "../controller/AuditController.js";


const AuditRouter = Router();



// AUDIT ROUTES



// CREATE AUDIT RECORD

AuditRouter.post(
    "/",
    createAuditController
);



// GET ALL AUDIT RECORDS

AuditRouter.get(
    "/",
    getAllAuditsController
);



// GET AUDITS BY TABLE NAME + RECORD ID
//
// Example:
// GET /audit/table/transactions_product/record/10

AuditRouter.get(
    "/table/:tableName/record/:recordId",
    getAuditsByTableAndRecordIdController
);



// GET AUDITS BY TABLE NAME
//
// Example:
// GET /audit/table/transactions_product

AuditRouter.get(
    "/table/:tableName",
    getAuditsByTableNameController
);



// GET AUDITS BY RECORD ID
//
// Example:
// GET /audit/record/10

AuditRouter.get(
    "/record/:recordId",
    getAuditsByRecordIdController
);



// GET AUDITS BY STORE
//
// Example:
// GET /audit/store/1

AuditRouter.get(
    "/store/:storeId",
    getAuditsByStoreController
);



// GET AUDITS BY USER
//
// Example:
// GET /audit/user/2

AuditRouter.get(
    "/user/:userId",
    getAuditsByUserController
);



// GET AUDITS BY SESSION
//
// Example:
// GET /audit/session/25

AuditRouter.get(
    "/session/:sessionId",
    getAuditsBySessionController
);



// GET AUDITS BY ACTION TYPE
//
// Example:
// GET /audit/action/UPDATE

AuditRouter.get(
    "/action/:actionType",
    getAuditsByActionTypeController
);



// GET AUDIT BY ID
//
// This must remain at the bottom.

AuditRouter.get(
    "/:id",
    getAuditByIdController
);


export default AuditRouter;