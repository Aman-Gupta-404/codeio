import { apiClient } from "@/lib/apiClient";
import {
  CreateProjectRequest,
  GetUsersProjects,
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
    apiClient.patch<any>(`${endpoint}/${data.projectId}`),
};
