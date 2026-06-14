import { Webhook } from "svix";
import type { Request, Response } from "express";

import { User } from "./users.types";
import * as userRepository from "./users.repository";
import { AppError } from "../../errors/app-error";

export const getUserByClerkId = async (id: string) => {
  const user = await userRepository.getUserByClerkId(id);
  return user;
};

export const handleClerkWebhook = async (req: Request, res: Response) => {
  // get the svixId from the request to veryify the webhook request
  const svixId = req.headers["svix-id"] as string;
  const svixTimestamp = req.headers["svix-timestamp"] as string;

  const svixSignature = req.headers["svix-signature"] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw AppError.badRequest("Missing svix headers");
  }

  const payload = req.body.toString();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  const evt = wh.verify(payload, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  }) as any;

  const eventType = evt.type;

  // USER CREATED
  if (eventType === "user.created") {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = evt.data;

    await userRepository.createUser({
      clerkId,
      email: email_addresses?.[0]?.email_address,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
    });
  }

  // USER UPDATED
  if (eventType === "user.updated") {
    const {
      id: clerkId,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = evt.data;

    await userRepository.updateUser({
      clerkId,
      email: email_addresses?.[0]?.email_address,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
    });
  }

  // USER login
  if (eventType === "session.created") {
    const { user_id } = evt.data;
    await userRepository.updateUserLastLogin(user_id);
  }

  return {
    success: true,
  };
};
