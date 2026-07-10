import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./infra/database/mongodb.js";
import { setupWorkspaceProxy } from "./infra/ws/proxy.js";

require("dotenv").config();

const PORT = process.env.PORT || 3001;

async function startServer() {
  // mongodb connection
  await connectDB(); // ✅ connect DB first

  const server = http.createServer(app);

  setupWorkspaceProxy(server);

  // const server = app.listen(PORT, () => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
