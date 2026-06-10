import express, { Router } from "express";

import { validate } from "../../middleware/validate";
import { getUserSchema } from "./users.validation";
import { getSingleUser } from "./users.controller";

const router = Router();

router.get("/:id", validate(getUserSchema), getSingleUser);

router.get(
  "/auth/webhook",
  express.raw({ type: "application/json" }),
  getSingleUser,
);

export default router;
