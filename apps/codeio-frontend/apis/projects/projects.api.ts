import { apiClient } from "@/lib/apiClient";
import { CreateProjectRequest } from "./projects.types";

const endpoint = "/api/v1/projects";

export const projectsApi = {
  createProject: (data: CreateProjectRequest) =>
    apiClient.post<any>(`${endpoint}`, data),
};
