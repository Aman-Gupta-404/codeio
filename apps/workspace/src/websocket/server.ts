import { WebSocketServer } from "ws";
import { registerSocketHandlers } from "./handlers";
import { TerminalManager } from "../terminal/terminal-manager";
import { Events } from "../types/events";

export function createWebSocketServer(port: number) {
  const terminalManager = new TerminalManager();

  const wss = new WebSocketServer({
    port,
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    // terminal setup and response handler
    const terminal = terminalManager.getSession();
    console.log({ terminal });
    terminal.onData((data) => {
      ws.send(
        JSON.stringify({
          event: Events.TERMINAL_OUTPUT,
          payload: {
            data,
          },
        }),
      );
    });

    terminal.onExit(() => {
      ws.send(
        JSON.stringify({
          event: Events.TERMINAL_EXIT,
        }),
      );
    });

    registerSocketHandlers(ws, terminal);

    ws.on("close", () => {
      console.log("Client disconnected");
    });

    setInterval(() => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.ping();
        }
      });
    }, 60000);
  });

  return wss;
}
