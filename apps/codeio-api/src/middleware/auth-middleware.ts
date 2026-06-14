import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import * as userService from "../modules/users/users.public";

export async function requireAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const { userId } = auth;
  console.log({ auth });

  if (!userId) {
    throw AppError.unauthorized();
  }

  // make API call to fetch user details
  const user = await userService.getUserByClerkId(userId);

  req.user = {
    _id: user._id.toString(),
    clerkId: userId,
  };

  next();
}
