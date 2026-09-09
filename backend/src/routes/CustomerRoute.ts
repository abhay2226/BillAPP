
import { Router } from "express";

import {
    createCustomer,
    getAllCustomers,
    getActiveCustomers,
    getCustomerById,
    getCustomerByPhone,
    searchCustomers,
    updateCustomer,
    deactivateCustomer,
    activateCustomer,
    getCustomerBills
} from "../controller/CustomerController.js";

import { authenticate } from "../middleware/Authenticate.js";
import { authorize } from "../middleware/Authorize.js";
import { requireStoreAccess } from "../middleware/requireStoreAccess.js";


const router = Router();
router.use(authenticate);

router.post("/",authorize("OWNER", "STAFF"), createCustomer);

router.get("/",authorize("OWNER", "STAFF"), getAllCustomers);

router.get("/active",authorize("OWNER", "STAFF"), getActiveCustomers);

router.get("/phone",authorize("OWNER", "STAFF"), getCustomerByPhone);

router.get("/search",authorize("OWNER","STAFF"), searchCustomers);

router.get("/:id",authorize("OWNER", "STAFF"), getCustomerById);

router.get("/:id/bills",authorize("OWNER","STAFF"), getCustomerBills);

router.put("/:id",authorize("OWNER","STAFF"), updateCustomer);

router.patch("/:id/deactivate",authorize("OWNER","STAFF"), deactivateCustomer);

router.patch("/:id/activate",authorize("OWNER","STAFF"), activateCustomer);

export default router;

