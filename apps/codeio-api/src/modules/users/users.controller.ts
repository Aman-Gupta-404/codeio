import { Request, Response, NextFunction } from "express";

import { getUserById } from "./users.service";
import { sendSuccess } from "../../utils/api-response";
import { GetUserParams } from "./users.types";
import { AppError } from "../../errors/app-error";

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
