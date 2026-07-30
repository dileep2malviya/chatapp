import { z } from "zod";

class ApiError extends Error {
    statusCode: number;
    data: null;
    success: boolean;
    errors: Record<string, string>;

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: Record<string, string> = {},
        stack?: string
    ) {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

const preparedErrorObject = (error:z.core.$ZodIssue[]) => {
    return Object.fromEntries(
          error.map(({ path, message }) => [path[0], message]))
}

const throwDuplicateError = (error: unknown): void => {
    if (error instanceof ApiError) {
        throw error;
    }

    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000
    ) {
        throw new ApiError(409, "Username or email already exists");
    }

    throw error;
};

export { 
    ApiError,
    preparedErrorObject,
    throwDuplicateError
};