import { Request, Response, NextFunction } from "express";

import * as projectService from "./projects.service";
import { sendSuccess } from "../../utils/api-response";
import { AppError } from "../../errors/app-error";

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { title } = req.body;
  const language = req.body.language.toLowerCase();

  if (!["python", "node"].includes(language)) {
    throw AppError.badRequest("Invalid language");
  }

  const project = await projectService.createProject({
    title,
    language,
    userId: req.user?._id || "",
  });

  return sendSuccess(res, 201, "Project created successfully", project);
};

export const runProject = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw AppError.badRequest("Invalid projectId");
  }

  const project = await projectService.runProject({
    projectId: projectId as string,
    userId: req.user?._id || "",
  });

  return sendSuccess(res, 200, "Project started successfully", project);
};

export const getUserProjects = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = (req.query.search as string)?.trim() || "";
  const userId = req.user?._id;

  if (!userId) {
    throw AppError.unauthorized();
  }

  const projectsData = await projectService.getUsersProjects({
    page,
    limit,
    search,
    userId,
  });

  return sendSuccess(
    res,
    200,
    "Users projects fetched successfully",
    projectsData,
  );
};

export const execProjectRuntime = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { projectId } = req.params;
  const { status } = req.body;
  console.log({ status, projectId });

  if (!projectId) {
    throw AppError.badRequest("Invalid projectId");
  }
  if (!status || !["run", "stop"].includes(status)) {
    throw AppError.badRequest("Invalid project status");
  }

  let project;
  let message: string;
  if (status === "run") {
    project = await projectService.runProject({
      projectId: projectId as string,
      userId: req.user?._id || "",
    });
    message = "Project started successfully";
  } else {
    project = await projectService.stopProject({
      projectId: projectId as string,
      userId: req.user?._id || "",
    });
    message = "Project stopped successfully";
  }

  return sendSuccess(res, 200, message, project);
};

export const getProjectStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { projectId } = req.params;
  const action = req.query.action as "starting" | "stopping";

  if (!projectId) {
    throw AppError.badRequest("Invalid projectId");
  }

  // if (!action || !["starting", "stopping"].includes(action)) {
  if (!action) {
    throw AppError.badRequest("Invalid action");
  }

  const statusData = await projectService.getProjectStatus({
    action,
    userId: req.user?._id || "",
    projectId: projectId as string,
  });

  return sendSuccess(res, 200, "Project status data fetched", statusData);
};

export const updateProjectActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { projectId } = req.params;

  const result = await projectService.updateProjectActivity({
    projectId: projectId as string,
    userId: req.user?._id || "",
  });

  return sendSuccess(res, 200, "Project status data fetched", result);
};

export const getProjectRunEligibility = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = await projectService.getProjectRunEligibility(
    req.user?._id || "",
  );

  return sendSuccess(res, 200, "Project status data fetched", result);
};
