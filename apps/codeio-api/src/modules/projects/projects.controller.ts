import { Request, Response, NextFunction } from "express";

import * as projectService from "./projects.service";
import { sendSuccess } from "../../utils/api-response";
import { getAuth } from "@clerk/express";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("h0");
  const { title, language } = req.body;

  const project = await projectService.createProject({
    title,
    language,
    userId: req.user?._id || "",
  });

  return sendSuccess(res, 201, "Project created successfully", project);
};
