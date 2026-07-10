// src/ws/proxy.ts

import WebSocket, { WebSocketServer } from "ws";
import http from "http";

export function setupWorkspaceProxy(server: http.Server) {
  const wss = new WebSocketServer({
    noServer: true,
  });

  server.on("upgrade", async (req, socket, head) => {
    if (!req.url?.startsWith("/ws/")) {
      return;
    }

    const projectId = req.url.split("/")[2];

    if (!projectId) {
      socket.destroy();

      return;
    }

    wss.handleUpgrade(req, socket, head, (clientWs) => {
      handleWorkspaceConnection(clientWs, projectId);
    });
  });
}

async function handleWorkspaceConnection(
  clientWs: WebSocket,
  projectId: string,
) {
  const namespace = process.env.K8S_NAMESPACE || "codeio";

  let workerUrl: string;

  if (process.env.NODE_ENV === "production") {
    workerUrl = `ws://worker-svc-${projectId}.${namespace}.svc.cluster.local:8080`;
  } else {
    // local development via ingress
    workerUrl = `ws://localhost/worker/${projectId}`;
  }

  const workerWs = new WebSocket(workerUrl);

  workerWs.on("open", () => {
    console.log(`Connected to worker ${projectId}`);
  });

  workerWs.on("message", (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  clientWs.on("message", (data) => {
    if (workerWs.readyState === WebSocket.OPEN) {
      workerWs.send(data);
    }
  });

  clientWs.on("close", () => {
    workerWs.close();
  });

  workerWs.on("close", () => {
    clientWs.close();
  });

  workerWs.on("error", (err) => {
    console.error(err);

    clientWs.close();
  });
}
