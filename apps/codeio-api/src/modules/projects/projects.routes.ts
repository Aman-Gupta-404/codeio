import express, { Router } from "express";

import * as projectController from "./projects.controller";

import { validate } from "../../middleware/validate";
import { createProjectSchema } from "./projects.validation";

const router = Router();

router.post(
  "/",
  validate(createProjectSchema),
  projectController.createProject,
);

export default router;
