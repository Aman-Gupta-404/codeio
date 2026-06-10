import { Request, Response, NextFunction } from "express";

import * as projectService from "./projects.service";
import { sendSuccess } from "../../utils/api-response";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { title, language } = req.body;

  const project = await projectService.createProject({ title, language });

  return sendSuccess(res, 201, "Project created successfully", project);
};
