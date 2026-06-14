import { CreateProject } from "./projects.types";
import { Project } from "./projects.model";

export const createProject = async (project: CreateProject) => {
  const { title, slug, language, userId } = project;

  const proj = await Project.create({
    title,
    slug,
    language,
    userId,
  });

  return proj;
};
