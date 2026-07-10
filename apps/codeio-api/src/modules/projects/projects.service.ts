import { generateSlug } from "random-word-slugs";
import * as projectRepository from "./projects.repository";
import { createWorkspacePod, waitForPodRunning } from "@repo/k8s";
import { GetUsersProjects, supportedLanguages } from "./projects.types";
import { copyTemplate } from "../../infra/r2";
import { generateWorkertoken } from "../../infra/tokens";

import {
  waitForPod,
  getWorkerEndpoints,
  createProjectResources,
  deleteProjectResources,
  waitForPodDeletion,
} from "../../infra/k8s/worker";
import { AppError } from "../../errors/app-error";
import { WorkspaceStatus } from "../../data/constants";

export const createProject = async (project: {
  title: string;
  userId: string;
  language: supportedLanguages;
}) => {
  const { title, language, userId } = project;
  const slug = generateSlug(4, { format: "kebab" });

  // 2. add project to DB
  const result = await projectRepository.createProject({
    title,
    language,
    slug,
    userId,
  });

  const projectId = result._id.toString();

  // copy the template in r2 storage
  await copyTemplate({ projectId, language: language });

  return {
    projectId,
    project: result,
  };
};

export const runProject = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) => {
  // 1. Get the existing project with projectId
  const project = await projectRepository.getUsersProject({
    projectId,
    userId,
  });

  // error check for if project does not exist
  if (!project) {
    throw AppError.notFound("Project not found!");
  }

  // check for if project is already running
  console.log({ project });
  if (project.status === WorkspaceStatus.down) {
    // run the project
    // starting the k8s pod
    await createProjectResources(projectId);
    // 2. start the kubernetes pod
    await waitForPod(projectId);

    // update the status
    await projectRepository.updateProjectStatus({
      projectId,
      status: WorkspaceStatus.running,
    });
  } else {
    // TODO: later, also check with k8s if pod is running
  }

  const token = generateWorkertoken(userId, projectId);

  // generate the pod status

  // const files = await fetchFolderFromR2("starter-templates/node/");
  // console.log({ files });

  // generate the workspace tokens

  return {
    project: project,
    projectId,
    token,
    status: WorkspaceStatus.running,
    // NOTE: Use wss in production for secure connection
    // wsUrl: `wss://${projectId}.ws.localtest.me`,
    wsUrl: `ws://${projectId}.ws.localtest.me`,
    // wsUrl: `http://localhost:8080`,
  };
};

export const stopProject = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) => {
  // 1. Get the existing project with projectId
  const project = await projectRepository.getUsersProject({
    projectId,
    userId,
  });

  // error check for if project does not exist
  if (!project) {
    throw AppError.notFound("Project not found!");
  }

  // check for if project is already running
  if (project.status !== WorkspaceStatus.running) {
    // TODO: check with k8s if it has already stopped, and update if required
  }

  // delete project resources
  await deleteProjectResources(projectId);
  // wait for deletion
  await waitForPodDeletion(projectId);

  // update the status
  await projectRepository.updateProjectStatus({
    projectId,
    status: WorkspaceStatus.down,
  });

  return {
    project: project,
    projectId,
    status: WorkspaceStatus.down,
  };
};

export const getUsersProjects = async (data: GetUsersProjects) => {
  const projects = await projectRepository.getUsersProjects(data);

  return projects;
};

export const getProject = async (data: any) => {
  // get the project from DB
  // check the project status
};

export const getProjectEndpoints = async (projectId: string) => {
  if (!projectId) {
    throw AppError.badRequest("Project Id is required");
  }
  return await getWorkerEndpoints(projectId);
};
