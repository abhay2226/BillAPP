import { AppDataSource } from "../datasource.js";
import { Customer } from "../entity/TransactionsCustomer.js";
import { Bill } from "../entity/TransactionsBill.js";
import { Like } from "typeorm";


// ======================================================
// CREATE CUSTOMER
// ======================================================

export const createCustomerService = async (
    phone_no: string | null,
    created_by: number
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    const customer = customerRepository.create({
        phone_no,
        is_active: true,
        created_at: new Date(),
        created_by
    });

    return await customerRepository.save(customer);
};


// ======================================================
// GET ALL CUSTOMERS
// ======================================================

export const getAllCustomersService = async () => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    return await customerRepository.find({
        order: {
            customer_id: "DESC"
        }
    });
};


// ======================================================
// GET ACTIVE CUSTOMERS
// ======================================================

export const getActiveCustomersService = async () => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    return await customerRepository.find({
        where: {
            is_active: true
        },
        order: {
            customer_id: "DESC"
        }
    });
};


// ======================================================
// GET CUSTOMER BY ID
// ======================================================

export const getCustomerByIdService = async (
    customer_id: number
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    const customer = await customerRepository.findOne({
        where: {
            customer_id
        }
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    return customer;
};


// ======================================================
// SEARCH CUSTOMER BY PHONE
// ======================================================

export const getCustomerByPhoneService = async (
    phone_no: string
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    const customer = await customerRepository.findOne({
        where: {
            phone_no,
            is_active: true
        }
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    return customer;
};


// ======================================================
// SEARCH CUSTOMERS
// ======================================================

export const searchCustomersService = async (
    search: string
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    return await customerRepository.find({
        where: {
            phone_no: Like(`%${search}%`),
            is_active: true
        },
        order: {
            customer_id: "DESC"
        }
    });
};


// ======================================================
// UPDATE CUSTOMER
// ======================================================

export const updateCustomerService = async (
    customer_id: number,
    phone_no: string | null,
    updated_by: number
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    const customer = await customerRepository.findOne({
        where: {
            customer_id
        }
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    customer.phone_no = phone_no;
    customer.updated_by = updated_by;
    customer.updated_at = new Date();

    return await customerRepository.save(customer);
};


// ======================================================
// DEACTIVATE CUSTOMER
// ======================================================

export const deactivateCustomerService = async (
    customer_id: number,
    updated_by: number
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    const customer = await customerRepository.findOne({
        where: {
            customer_id
        }
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    customer.is_active = false;
    customer.updated_by = updated_by;
    customer.updated_at = new Date();

    return await customerRepository.save(customer);
};


// ======================================================
// ACTIVATE CUSTOMER
// ======================================================

export const activateCustomerService = async (
    customer_id: number,
    updated_by: number
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    const customer = await customerRepository.findOne({
        where: {
            customer_id
        }
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    customer.is_active = true;
    customer.updated_by = updated_by;
    customer.updated_at = new Date();

    return await customerRepository.save(customer);
};


// ======================================================
// GET CUSTOMER BILLS
// ======================================================

export const getCustomerBillsService = async (
    customer_id: number
) => {

    const customerRepository =
        AppDataSource.getRepository(Customer);

    const customer = await customerRepository.findOne({
        where: {
            customer_id
        }
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    const billRepository =
        AppDataSource.getRepository(Bill);

    return await billRepository.find({
        where: {
            customer_id
        },
        order: {
            created_at: "DESC"
        }
    });
};