import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../errors/app-error";

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log({ param: req.params });
      schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });

      next();
    } catch (error) {
      console.log({ error });
      if (error instanceof ZodError) {
        return next(
          AppError.badRequest(
            "Validation failed",
            error.issues.map((issue) => issue.message),
          ),
        );
      }

      next(error);
    }
  };
