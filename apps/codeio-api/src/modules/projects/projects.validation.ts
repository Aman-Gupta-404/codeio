import z from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.email(),
  }),
});
