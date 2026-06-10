import { generateSlug } from "random-word-slugs";
import * as projectRepository from "./projects.repository";

export const createProject = async (project: {
  title: string;
  language: string;
}) => {
  const { title, language } = project;
  const slug = generateSlug(4, { format: "kebab" });
  // 1. add project to DB
  const result = await projectRepository.createProject({
    title,
    language,
    slug,
  });

  // 2. start the kubernetes pod

  return result;
};
