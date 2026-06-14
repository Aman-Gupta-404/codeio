import express, { Router } from "express";

import { validate } from "../../middleware/validate";
import { getUserSchema } from "./users.validation";
import { handleClerkWebhook } from "./users.controller";

const router = Router();

// router.get("/:id", validate(getUserSchema), getSingleUser);

router.post(
  // "/auth/webhook",
  "/webhook",
  express.raw({ type: "application/json" }),
  handleClerkWebhook,
);

export default router;
