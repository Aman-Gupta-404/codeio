export interface CreateProjectRequest {
  title: string;
  language: string;
}
export interface RunProjectRequest {
  projectId: string;
  status: "run" | "stop";
}
export interface GetUsersProjects {
  page?: number;
  limit?: number;
  search?: number;
}
