import { generateSlug } from "random-word-slugs";
import * as projectRepository from "./projects.repository";
import { GetUsersProjects, supportedLanguages } from "./projects.types";
import { copyTemplate } from "../../infra/r2";
import { generateWorkertoken } from "../../infra/tokens";

import {
  waitForPod,
  createProjectResources,
  deleteProjectResources,
  waitForPodDeletion,
  getPodRunningStatus,
  getPodDeleteStatus,
} from "../../infra/k8s/worker";
import { AppError } from "../../errors/app-error";
import { WorkspaceStatus } from "../../data/constants";

export const createProject = async (project: {
  title: string;
  userId: string;
  language: supportedLanguages;
}) => {
  const { title, language, userId } = project;

  // 1. check if total projecs < 5 & all projects are down
  const projectStatus = await projectRepository.getUserAllProjectStatus(userId);

  if (projectStatus.total >= 5) {
    throw AppError.badRequest("You have reached your project creation limit");
  }

  if (
    projectStatus?.total > 0 &&
    projectStatus?.projectsDown < projectStatus?.total
  ) {
    throw AppError.badRequest(
      "Please close running projects before creating a new project",
    );
  }

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
  if (project.status === WorkspaceStatus.down) {
    // run the project
    // starting the k8s pod
    await createProjectResources(projectId);
    // 2. start the kubernetes pod
    // await waitForPod(projectId);

    // update the status
    // await projectRepository.updateProjectStatus({
    //   projectId,
    //   status: WorkspaceStatus.running,
    // });
  } else {
    // TODO: later, also check with k8s if pod is running
  }

  return {
    project: project,
    projectId,
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
  // if (project.status !== WorkspaceStatus.running) {
  //   // TODO: check with k8s if it has already stopped, and update if required
  //   return {
  //     project: project,
  //     projectId,
  //   };
  // }

  // delete project resources
  await deleteProjectResources(projectId);

  return {
    project: project,
    projectId,
    // status: WorkspaceStatus.down,
  };
};

export const getProjectStatus = async ({
  userId,
  action,
  projectId,
}: {
  userId: string;
  projectId: string;
  action: "starting" | "stopping";
}) => {
  if (action === "starting") {
    const statusData = await getPodRunningStatus(projectId);
    if (statusData.started) {
      // update the project status in DB
      await projectRepository.updateProjectStatus({
        projectId,
        status: WorkspaceStatus.running,
      });

      const token = generateWorkertoken(userId, projectId);

      return {
        projectId,
        status: "running",
        token: token,
        // NOTE: Use wss in production for secure connection
        // TODO: Shift to env
        wsUrl: `wss://${projectId}.ws.codeio.amangupta.work`,
        // wsUrl: `ws://${projectId}.ws.localtest.me`,
      };
    } else {
      return {
        projectId,
        status: "starting",
      };
    }
  } else {
    const statusData = await getPodDeleteStatus(projectId);
    if (statusData.deleted) {
      await projectRepository.updateProjectStatus({
        projectId,
        status: WorkspaceStatus.down,
      });

      return {
        projectId,
        status: "deleted",
      };
    } else {
      return {
        projectId,
        status: "deleting",
      };
    }
  }
};

export const getUsersProjects = async (data: GetUsersProjects) => {
  const projects = await projectRepository.getUsersProjects(data);

  return projects;
};

export const updateProjectActivity = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) => {
  const project = await projectRepository.getUsersProject({
    projectId,
    userId,
  });

  if (!project) {
    throw AppError.notFound("Project not found");
  }

  // if the project id already down, send the down status
  if (["down", "stopping"].includes(project.status)) {
    return {
      project,
      status: project.status,
    };
  }
  console.log("-- reached here ---");
  // if project exists --> then update the last active field
  await projectRepository.updateLastActive({ projectId, userId });

  return { project, status: "running" };
};

export const stopInactiveWorkspaces = async () => {
  try {
    console.log("===== stopping inactive workspaces - service ======");
    const projects = await projectRepository.stopInactiveWorkspaces();

    const projectIds = projects.map((p) => p._id.toString());

    console.log({ projectIds });

    if (projectIds.length) {
      console.log(`Stopping ${projectIds.length} projects`);

      await Promise.all(
        projectIds.map((projectId) => deleteProjectResources(projectId)),
      );

      await projectRepository.markProjectsAsStopped(projectIds);
      return;
    }

    return true;
  } catch (error) {
    console.log("==== error in cleanup job ====");
    console.log(error);
    return true;
  }
};

export const getProjectRunEligibility = async (userId: string) => {
  const projectStatus = await projectRepository.getUserAllProjectStatus(userId);
  console.log({ projectStatus });
  if (
    projectStatus?.total > 0 &&
    projectStatus?.projectsDown < projectStatus?.total
  ) {
    return {
      eligible: false,
    };
  }

  return {
    eligible: true,
  };
};
