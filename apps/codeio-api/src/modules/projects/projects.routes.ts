import express, { Router } from "express";

import * as projectController from "./projects.controller";

import { validate } from "../../middleware/validate";
import { createProjectSchema } from "./projects.validation";
import { requireAuthMiddleware } from "../../middleware/auth-middleware";

const router = Router();

// create project
router.post(
  "/",
  requireAuthMiddleware,
  validate(createProjectSchema),
  projectController.createProject,
);

// run existing projects
router.patch(
  "/:projectId",
  requireAuthMiddleware,
  projectController.runProject,
);

// get users all projects
router.get("/", requireAuthMiddleware, projectController.getUserProjects);

export default router;
