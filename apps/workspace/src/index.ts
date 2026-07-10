import path from "path";
import { createWebSocketServer } from "./websocket/server";
import { mkdir } from "fs/promises";

async function bootstrap() {
  try {
    // creaate the required workspace folder
    // const folderPath = path.join(process.cwd(), "workspace");
    // await mkdir(folderPath, {
    //   recursive: true,
    // });

    const port = Number(process.env.PORT) || 8080;

    const server = createWebSocketServer(port);

    console.log(`🚀 Worker service started on port ${port}`);

    const shutdown = () => {
      console.log("Shutting down worker...");

      server.close(() => {
        console.log("Worker stopped");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start worker:", error);

    process.exit(1);
  }
}

bootstrap();
