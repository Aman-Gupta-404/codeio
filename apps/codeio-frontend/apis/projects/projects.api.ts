import { apiClient } from "@/lib/apiClient";
import {
  CreateProjectRequest,
  GetProjectStatusRequest,
  GetUsersProjects,
  ProjectStatusResponse,
  RunProjectEligibilityResponse,
  RunProjectRequest,
} from "./projects.types";
import { buildUrlSearchQuery } from "@/lib/parse-query";

const endpoint = "/api/v1/projects";

export const projectsApi = {
  getUsersProjects: (data: GetUsersProjects) =>
    apiClient.get<any>(`${endpoint}?${buildUrlSearchQuery(data)}`),

  createProject: (data: CreateProjectRequest) =>
    apiClient.post<any>(`${endpoint}`, data),

  runProject: (data: RunProjectRequest) =>
    apiClient.patch<any>(`${endpoint}/${data.projectId}/run-time`, {
      status: data.status,
    }),

  getProjectStatus: (data: GetProjectStatusRequest) =>
    apiClient.get<ProjectStatusResponse>(
      `${endpoint}/${data.projectId}/status?action=${data.action}`,
    ),

  updateProjectActivity: (projectId: string) =>
    apiClient.patch<ProjectStatusResponse>(`${endpoint}/${projectId}/activity`),

  getRunProjectEligibility: () =>
    apiClient.get<RunProjectEligibilityResponse>(`${endpoint}/eligibility`),
};
