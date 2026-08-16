import { Router } from "express";

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
  "/:projectId/run-time",
  requireAuthMiddleware,
  projectController.execProjectRuntime,
);

// get users all projects
router.get("/", requireAuthMiddleware, projectController.getUserProjects);

// get project status
router.get(
  "/:projectId/status",
  requireAuthMiddleware,
  projectController.getProjectStatus,
);

// Update project status
router.patch(
  "/:projectId/activity",
  requireAuthMiddleware,
  projectController.updateProjectActivity,
);

// route to check if project can be started
router.get(
  "/eligibility",
  requireAuthMiddleware,
  projectController.getProjectRunEligibility,
);

export default router;
