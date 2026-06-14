import { generateSlug } from "random-word-slugs";
import * as projectRepository from "./projects.repository";

export const createProject = async (project: {
  title: string;
  userId: string;
  language: string;
}) => {
  console.log("h1");
  const { title, language, userId } = project;
  const slug = generateSlug(4, { format: "kebab" });

  // 2. add project to DB
  const result = await projectRepository.createProject({
    title,
    language,
    slug,
    userId,
  });

  // 2. start the kubernetes pod

  return result;
};
