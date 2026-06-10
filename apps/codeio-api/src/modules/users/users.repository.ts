import { CreateUser } from "./users.types";
import { User } from "./users.model";

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
