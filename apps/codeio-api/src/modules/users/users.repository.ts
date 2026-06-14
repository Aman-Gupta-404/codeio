import { CreateUser } from "./users.types";
import { User } from "./users.model";
import { AppError } from "../../errors/app-error";

export const getUserByClerkId = async (id: string) => {
  const user = await User.findOne({ clerkId: id });

  if (!user) throw AppError.notFound("User not found");

  return user;
};

export const createUser = async (user: CreateUser) => {
  const { clerkId, email, firstName, lastName, imageUrl } = user;

  const response = await User.findOneAndUpdate(
    {
      clerkId,
    },
    {
      email,
      lastName,
      imageUrl,
      firstName,
      lastLoginAt: new Date(),
    },
    {
      upsert: true,
      new: true,
    },
  );

  return response;
};

export const updateUser = async (user: CreateUser) => {
  const { clerkId, email, firstName, lastName, imageUrl } = user;

  const response = await User.findOneAndUpdate(
    {
      clerkId,
    },
    {
      $set: { lastName, imageUrl, firstName },
    },
  );

  return response;
};

export const updateUserLastLogin = async (clerkId: string) => {
  const response = await User.findOneAndUpdate(
    {
      clerkId: clerkId,
    },
    {
      $set: { lastLoginAt: new Date() },
    },
  );

  return response;
};
