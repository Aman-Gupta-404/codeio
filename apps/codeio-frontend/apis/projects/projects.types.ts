export interface CreateProjectRequest {
  title: string;
  language: string;
}
export interface RunProjectRequest {
  projectId: string;
  status: "run" | "stop";
}

export interface GetProjectStatusRequest {
  projectId: string;
  action: "starting" | "stopping";
}

export interface ProjectStatusResponse {
  token: string;
  wsUrl: string;
  projectId: string;
  status: "running" | "starting" | "deleted" | "deleting";
}
export interface RunProjectEligibilityResponse {
  eligible: boolean;
}

export interface GetUsersProjects {
  page?: number;
  limit?: number;
  search?: number;
}
