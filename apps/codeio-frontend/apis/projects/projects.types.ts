export interface CreateProjectRequest {
  title: string;
  language: string;
}
export interface RunProjectRequest {
  projectId: string;
}
export interface GetUsersProjects {
  page?: number;
  limit?: number;
  search?: number;
}
