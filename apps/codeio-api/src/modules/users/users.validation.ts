import { z } from "zod";

export const getUserSchema = z.object({
  params: z.object({
    // id: z.string().uuid("Invalid user id"),
    id: z.string("Invalid user id"),
  }),
});

// export const createUserSchema = z.object({
//   body: z.object({
//     name: z.string().min(2),
//     email: z.email(),
//   }),
// });
