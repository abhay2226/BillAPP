
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

import { verifyToken } from "../utils/jwt.js";

const router = Router();

router.use(verifyToken);

router.post("/", createCustomer);

router.get("/", getAllCustomers);

router.get("/active", getActiveCustomers);

router.get("/phone", getCustomerByPhone);

router.get("/search", searchCustomers);

router.get("/:id", getCustomerById);

router.get("/:id/bills", getCustomerBills);

router.put("/:id", updateCustomer);

router.patch("/:id/deactivate", deactivateCustomer);

router.patch("/:id/activate", activateCustomer);

export default router;

