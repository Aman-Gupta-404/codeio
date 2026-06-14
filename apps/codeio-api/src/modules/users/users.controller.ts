import { Request, Response, NextFunction } from "express";

import * as userService from "./users.service";
import { AppError } from "../../errors/app-error";
import { sendSuccess } from "../../utils/api-response";

export const handleClerkWebhook = async (req: Request, res: Response) => {
  const result = await userService.handleClerkWebhook(req, res);
  console.log({ result });
  return sendSuccess(res, 200, "request successful", result);
};
