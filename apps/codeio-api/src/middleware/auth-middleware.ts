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
  // const { userId } = auth;
  const userId = "user_3F5iKWhQPRxn0P8Que3UrHzrQFC";

  // TODO: undo this
  // if (!userId) {
  //   throw AppError.unauthorized();
  // }

  // make API call to fetch user details
  const user = await userService.getUserByClerkId(userId);

  req.user = {
    _id: user._id.toString(),
    clerkId: userId,
  };

  next();
}
