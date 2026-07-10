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
  console.log({ language });

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
