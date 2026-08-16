import {
  CreateProject,
  GetUsersProject,
  GetUsersProjects,
  UpdateProjectStatus,
} from "./projects.types";

import { Project } from "./projects.model";
import { PipelineStage } from "mongoose";
import { toObjectId } from "../../utils/helpers";
import { AppError } from "../../errors/app-error";

export const createProject = async (project: CreateProject) => {
  const { title, slug, language, userId } = project;

  const proj = await Project.create({
    title,
    slug,
    language,
    userId,
  });

  console.log({ proj });

  return proj;
};

export const getUsersProjects = async ({
  userId,
  page = 1,
  limit = 10,
  search = "",
}: GetUsersProjects) => {
  const p = Number(page);
  const l = Number(limit);

  const pipeline: PipelineStage[] = [
    {
      $match: {
        userId: toObjectId(userId),
        ...(search && {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        }),
      },
    },
    {
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: (p - 1) * l },
          { $limit: l },
        ],
        metadata: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await Project.aggregate(pipeline);

  const projects = result.data;
  const total = result.metadata[0]?.total ?? 0;

  return {
    data: projects,
    pagination: {
      total,
      page: p,
      limit: l,
      totalPages: Math.ceil(total / l),
    },
  };
};

export const getUsersProject = async ({
  projectId,
  userId,
}: GetUsersProject) => {
  const proj = await Project.findOne({
    _id: projectId,
    userId: userId,
  });

  return proj;
};

export const updateProjectStatus = async ({
  projectId,
  status,
}: UpdateProjectStatus) => {
  const res = await Project.updateOne(
    {
      _id: projectId,
    },
    {
      $set: {
        status: status,
        lastActive: new Date(),
        updatedAt: new Date(),
      },
    },
  );

  if (res.acknowledged && res.modifiedCount) {
    return true;
  }

  if (!res.matchedCount) {
    throw AppError.notFound("Project not found");
  }
};

export const updateLastActive = async ({
  projectId,
  userId,
}: GetUsersProject) => {
  const proj = await Project.updateOne(
    {
      _id: toObjectId(projectId),
      userId: userId,
    },
    {
      $set: {
        lastActive: new Date(),
      },
    },
  );

  if (!proj.matchedCount) {
    throw AppError.notFound("Project not found");
  }

  return true;
};

export const stopInactiveWorkspaces = async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const projects = await Project.find({
    lastActive: {
      $exists: true,
      $lt: tenMinutesAgo,
    },
    status: "running",
  });

  const ids = projects.map((p) => p._id);

  if (ids.length > 0) {
    await Project.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "stopping" } },
    );
  }

  return projects;
};

export const markProjectsAsStopped = async (projectIds: string[]) => {
  await Project.updateMany(
    {
      _id: { $in: projectIds },
    },
    {
      $set: { status: "down" },
    },
  );
};

export const getUserAllProjectStatus = async (userId: string) => {
  const status = await Project.aggregate([
    {
      $match: { userId: toObjectId(userId) },
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        down: [{ $match: { status: "down" } }, { $count: "count" }],
      },
    },
    {
      $project: {
        total: { $ifNull: [{ $first: "$total.count" }, 0] },
        projectsDown: { $ifNull: [{ $first: "$down.count" }, 0] },
      },
    },
  ]);

  console.log({ status });

  return status[0];
};
