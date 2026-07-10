// src/index.ts

import http from "http";
import jwt from "jsonwebtoken";
import httpProxy from "http-proxy";

const proxy = httpProxy.createProxyServer({
  ws: true,
});

// const server = http.createServer();

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    return res.end("OK");
  }

  res.writeHead(404);
  res.end();
});

server.on("upgrade", async (req, socket, head) => {
  try {
    console.log("Host:", req.headers.host);
    console.log("URL:", req.url);

    const host = req.headers.host!;

    // abc123.ws.localtest.me

    const projectId = host.split(".")[0];

    const url = new URL(req.url!, "http://localhost");

    console.log("Pathname:", url.pathname);
    console.log("Token:", url.searchParams.get("token"));

    const token = url.searchParams.get("token");

    if (!token) throw new Error("No token");

    const payload = jwt.verify(token, process.env.WORKSPACE_SECRET!) as any;

    if (payload.projectId !== projectId) {
      throw new Error("Forbidden");
    }

    const target = `ws://worker-svc-${projectId}.codeio.svc.cluster.local:8080`;

    console.log("Target:", target);

    proxy.ws(req, socket, head, {
      target,
    });
    proxy.on("error", (err) => {
      console.error("Proxy error:", err);
    });
  } catch (err) {
    console.log({ err });
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");

    socket.destroy();
  }
});

server.listen(3000, () => {
  console.log("Gateway started");
});
