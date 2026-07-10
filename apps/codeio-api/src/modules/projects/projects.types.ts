import type { CreateProject as CreateProjectType } from "@repo/types";

export type projectStatus = "down" | "starting" | "running" | "stopping";

export type CreateProject = CreateProjectType & {
  slug: string;
  userId: string;
};

export type GetUsersProjects = {
  page?: number;
  limit?: number;
  userId: string;
  search?: string;
};

export type GetUsersProject = {
  projectId: string;
  userId: string;
};

export type UpdateProjectStatus = {
  projectId: string;
  status: projectStatus;
};

export type supportedLanguages = "node" | "python";
