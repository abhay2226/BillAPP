import { Router } from "express";

import {
    createAuditController,
    getAllAuditsController,
    getAuditByIdController,
    getAuditsByTableNameController,
    getAuditsByRecordIdController,
    getAuditsByTableAndRecordIdController,
    getAuditsByStoreController,
    getAuditsBySessionController,
    getAuditsByActionTypeController
} from "../controller/AuditController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";



const AuditRouter = Router();
AuditRouter.use(authenticate);


// AUDIT ROUTES

// CREATE AUDIT RECORD

AuditRouter.post(
    "/",
    createAuditController
);



// GET ALL AUDIT RECORDS

AuditRouter.get(
    "/",authorize("OWNER" ),
    getAllAuditsController
);



// GET AUDITS BY TABLE NAME + RECORD ID
//
// Example:
// GET /audit/table/transactions_product/record/10

AuditRouter.get(
    "/table/:tableName/record/:recordId",authorize("OWNER" ),
    getAuditsByTableAndRecordIdController
);



// GET AUDITS BY TABLE NAME
//
// Example:
// GET /audit/table/transactions_product

AuditRouter.get(
    "/table/:tableName",authorize("OWNER" ),
    getAuditsByTableNameController
);



// GET AUDITS BY RECORD ID
//
// Example:
// GET /audit/record/10

AuditRouter.get(
    "/record/:recordId",authorize("OWNER" ),
    getAuditsByRecordIdController
);



// GET AUDITS BY STORE
//
// Example:
// GET /audit/store/1

AuditRouter.get(
    "/store/:storeId",authorize("OWNER" ),
    getAuditsByStoreController
);






// GET AUDITS BY SESSION
//
// Example:
// GET /audit/session/25

AuditRouter.get(
    "/session/:sessionId",authorize("OWNER" ),
    getAuditsBySessionController
);



// GET AUDITS BY ACTION TYPE
//
// Example:
// GET /audit/action/UPDATE

AuditRouter.get(
    "/action/:actionType",authorize("OWNER" ),
    getAuditsByActionTypeController
);



// GET AUDIT BY ID
//
// This must remain at the bottom.

AuditRouter.get(
    "/:id",authorize("OWNER" ),
    getAuditByIdController
);


export default AuditRouter;