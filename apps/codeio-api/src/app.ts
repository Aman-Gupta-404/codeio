import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error-handler";

import usersRoutes from "./modules/users/users.routes";
import { asyncHandler } from "./utils/async-handler";

const app = express();

app.use(cors());
app.use(express.json());

// routes

app.get("/api/health", (_, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/v1/users", asyncHandler(usersRoutes));

// error handler middleware
app.use(errorHandler);

export default app;
