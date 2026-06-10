import { Request, Response, NextFunction } from "express";

import { getUserById } from "./users.service";
import * as userService from "./users.service";
import { AppError } from "../../errors/app-error";
import { sendSuccess } from "../../utils/api-response";

export const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id as string;
  const user = await getUserById(id);

  if (!user) {
    throw AppError.notFound("User not found");
  }

  return sendSuccess(res, 200, "User fetched successfully", user);
};

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const result = await userService.handleClerkWebhook(req, res);
  return sendSuccess(res, 200, "request successful", result);
};
