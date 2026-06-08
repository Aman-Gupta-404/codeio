import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      statusCode: err.statusCode,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    errors: [],
    statusCode: 500,
  });
}
