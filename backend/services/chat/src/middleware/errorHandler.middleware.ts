import { type Request, type Response, type NextFunction } from "express";
import { ApiError } from "../utils/errorApi.js";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success ?? false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors ?? [],
    });
  }

  const anyErr = err as any;

  if (anyErr && anyErr.name === "ValidationError" && anyErr.errors) {
    const details = Object.keys(anyErr.errors).map((field) => ({
      field,
      message: anyErr.errors[field].message,
    }));

    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Validation Error",
      errors: details,
    });
  }

  if (anyErr && anyErr.name === "CastError") {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: anyErr.message || "Invalid value",
      errors: [{ message: anyErr.message }],
    });
  }

  console.error("Unhandled Global Error:", anyErr);
  return res.status(500).json({
    success: false,
    statusCode: 500,
    message: anyErr?.message ?? "Internal Server Error",
    errors: [],
  });
};

export { errorHandler };