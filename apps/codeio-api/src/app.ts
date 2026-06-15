import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

import { errorHandler } from "./middleware/error-handler";

import usersRoutes from "./modules/users/users.routes";
import projectsRouts from "./modules/projects/projects.routes";

import { asyncHandler } from "./utils/async-handler";
import { testFunc } from "@repo/k8s";

const app = express();

app.use(cors());

// Making sure user webhook endpoint gets raw express data
app.use(
  "/api/v1/users/webhook",
  express.raw({
    type: "application/json",
  }),
);

app.get("/api/health", (_, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

app.use(express.json());
app.use(clerkMiddleware());

testFunc();

app.use("/api/v1/users", asyncHandler(usersRoutes));
app.use("/api/v1/projects", asyncHandler(projectsRouts));

// error handler middleware
app.use(errorHandler);

export default app;
