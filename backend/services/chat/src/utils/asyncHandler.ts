import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
// import { ApiError } from "./errorApi.js";

const asyncHandler = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      console.error("Unhandled Controller Error:", error);
      next(error);
    }
  };
};

export { asyncHandler };