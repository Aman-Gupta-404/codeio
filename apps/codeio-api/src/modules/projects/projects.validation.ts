import z from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3),
    language: z.string(),
  }),
});
