import type { CreateProject as CreateProjectType } from "@repo/types";

export type CreateProject = CreateProjectType & {
  slug: string;
  userId: string;
};

export type supportedLanguages = "node" | "python";
