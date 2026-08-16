import "dotenv/config";
import http from "http";
import app from "./app.js";
import { connectDB } from "./infra/database/mongodb.js";
import { setupWorkspaceProxy } from "./infra/ws/proxy.js";
import scheduler from "./infra/cron/register.js";

require("dotenv").config();

const PORT = Number(process.env.PORT) || 3001;

function initializeCron() {
  scheduler.start();
}

async function startServer() {
  // mongodb connection
  await connectDB(); // ✅ connect DB first

  const server = http.createServer(app);

  setupWorkspaceProxy(server);

  // const server = app.listen(PORT, () => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });

  // initialize cron
  initializeCron();
}

startServer();
