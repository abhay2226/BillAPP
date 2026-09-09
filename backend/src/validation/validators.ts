import { BadRequestError } from "../utils/AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(body: any) {
    if (!body || typeof body !== "object") {
        throw new BadRequestError("Request body is required.");
    }

    const { firstname, email, password, store_id, store_name, gst_no, role_id } = body;

    if (!firstname || typeof firstname !== "string" || !firstname.trim()) {
        throw new BadRequestError("First name is required.");
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        throw new BadRequestError("A valid email address is required.");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters long.");
    }

    if (store_id !== undefined && store_id !== null) {
        const parsedStoreId = Number(store_id);
        if (!Number.isInteger(parsedStoreId) || parsedStoreId <= 0) {
            throw new BadRequestError("store_id must be a positive integer.");
        }
    } else {
        if (!store_name || typeof store_name !== "string" || !store_name.trim()) {
            throw new BadRequestError("store_name is required when creating a new store.");
        }
        if (!gst_no || typeof gst_no !== "string" || !gst_no.trim()) {
            throw new BadRequestError("gst_no is required when creating a new store.");
        }
    }

    if (role_id !== undefined && role_id !== null) {
        const parsedRoleId = Number(role_id);
        if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
            throw new BadRequestError("role_id must be a positive integer.");
        }
    }
}

export function validateLogin(body: any) {
    if (!body || typeof body !== "object") {
        throw new BadRequestError("Request body is required.");
    }

    const { email, password } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        throw new BadRequestError("A valid email address is required.");
    }

    if (!password || typeof password !== "string") {
        throw new BadRequestError("Password is required.");
    }
}

export function validateCreateUser(body: any) {
    if (!body || typeof body !== "object") {
        throw new BadRequestError("Request body is required.");
    }

    const { firstname, email, password, role_id } = body;

    if (!firstname || typeof firstname !== "string" || !firstname.trim()) {
        throw new BadRequestError("First name is required.");
    }

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
        throw new BadRequestError("A valid email address is required.");
    }

    if (!password || typeof password !== "string" || password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters long.");
    }

    const parsedRoleId = Number(role_id);
    if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
        throw new BadRequestError("A valid positive integer role_id is required.");
    }
}

export function validateUserUpdate(body: any) {
    if (!body || typeof body !== "object") {
        throw new BadRequestError("Request body is required.");
    }

    const { email, firstname, lastname, is_active, role_id } = body;

    if (email !== undefined) {
        if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
            throw new BadRequestError("A valid email address is required.");
        }
    }

    if (firstname !== undefined) {
        if (typeof firstname !== "string" || !firstname.trim()) {
            throw new BadRequestError("First name cannot be empty.");
        }
    }

    if (lastname !== undefined && lastname !== null) {
        if (typeof lastname !== "string") {
            throw new BadRequestError("Last name must be a string.");
        }
    }

    if (is_active !== undefined && typeof is_active !== "boolean") {
        throw new BadRequestError("is_active must be a boolean.");
    }

    if (role_id !== undefined) {
        const parsedRoleId = Number(role_id);
        if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
            throw new BadRequestError("role_id must be a positive integer.");
        }
    }
}

export function validateStoreUpdate(body: any) {
    if (!body || typeof body !== "object") {
        throw new BadRequestError("Request body is required.");
    }

    const { store_name, gst_no, location, is_active } = body;

    if (
        store_name === undefined &&
        gst_no === undefined &&
        location === undefined &&
        is_active === undefined
    ) {
        throw new BadRequestError("At least one field to update is required.");
    }

    if (store_name !== undefined) {
        if (typeof store_name !== "string" || !store_name.trim()) {
            throw new BadRequestError("Store name cannot be empty.");
        }
    }

    if (gst_no !== undefined) {
        if (typeof gst_no !== "string" || !gst_no.trim()) {
            throw new BadRequestError("GST number cannot be empty.");
        }
    }

    if (is_active !== undefined && typeof is_active !== "boolean") {
        throw new BadRequestError("is_active must be a boolean.");
    }
}

export function validateIdParam(param: any, fieldName: string = "ID"): number {
    const num = Number(param);
    if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        throw new BadRequestError(`Invalid ${fieldName}. Must be a positive integer.`);
    }
    return num;
}
