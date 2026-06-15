import { generateSlug } from "random-word-slugs";
import * as projectRepository from "./projects.repository";
import { createWorkspacePod, waitForPodRunning } from "@repo/k8s";
import { supportedLanguages } from "./projects.types";
import { fetchFolderFromR2 } from "../../infra/r2";

export const createProject = async (project: {
  title: string;
  userId: string;
  language: supportedLanguages;
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

  console.log({ result });

  const files = await fetchFolderFromR2("starter-templates/node/");
  console.log({ files });

  // 2. start the kubernetes pod
  // const pod = await createWorkspacePod(userId, result._id.toString(), language);

  // await waitForPodRunning(pod.podName, 10000);

  return result;
};
