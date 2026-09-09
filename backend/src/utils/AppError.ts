import type { Response } from "express";

export class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad request.") {
        super(message, 400);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized.") {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = "Forbidden access.") {
        super(message, 403);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found.") {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Resource conflict.") {
        super(message, 409);
    }
}

export function sendErrorResponse(
    res: Response,
    error: unknown,
    defaultStatus: number = 500
) {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    const message = error instanceof Error ? error.message : "An unexpected error occurred.";

    let status = defaultStatus;
    if (/not found/i.test(message)) {
        status = 404;
    } else if (/unauthorized|invalid token|bearer token|expired/i.test(message)) {
        status = 401;
    } else if (/forbidden|only an owner|only this store|not authorized|restricted|cannot register as owner/i.test(message)) {
        status = 403;
    } else if (/already exists|already in use|already deactivated|already logged out|already active/i.test(message)) {
        status = 409;
    } else if (/invalid|required|must be/i.test(message)) {
        status = 400;
    }

    return res.status(status).json({
        success: false,
        message
    });
}
