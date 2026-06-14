import express, { Router } from "express";

import * as projectController from "./projects.controller";

import { validate } from "../../middleware/validate";
import { createProjectSchema } from "./projects.validation";
import { requireAuthMiddleware } from "../../middleware/auth-middleware";
import { requireAuth } from "@clerk/express";

const router = Router();

// create project
router.post(
  "/",
  requireAuthMiddleware,
  validate(createProjectSchema),
  projectController.createProject,
);

export default router;
