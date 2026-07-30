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
      statusCode: err.statusCode,
      message: err.message,
      success: err.success,
      errors: err.errors,
    });
  }

  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
    success: false,
    errors: [],
  });
};

export { errorHandler };