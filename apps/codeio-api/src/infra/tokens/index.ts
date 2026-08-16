import jwt from "jsonwebtoken";

export const generateWorkertoken = (userId: string, projectId: string) => {
  const token = jwt.sign(
    {
      userId: userId,
      projectId,
    },
    process.env.WORKSPACE_SECRET!,
    {
      expiresIn: "12h",
    },
  );

  return token;
};
