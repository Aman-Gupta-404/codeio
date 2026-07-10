import { WebSocket } from "ws";
import { Events } from "../../types/events";
import {
  createFileHandler,
  createFolderHandler,
  deleteFileHandler,
  deleteFolderHandler,
  getTree,
  readFileHandler,
  writeFileHandler,
} from "./handlers";
import { PtySession } from "../../terminal/pty-session";

export function registerSocketHandlers(ws: WebSocket, terminal: PtySession) {
  ws.on("message", async (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      console.log({ message });
      const { event, payload, requestId } = message;

      switch (event) {
        case Events.READ_FILE:
          await readFileHandler(ws, payload.path);
          break;

        case Events.CREATE_FILE:
          await createFileHandler(ws, payload.path, payload.name);
          break;

        case Events.WRITE_FILE:
          await writeFileHandler(
            ws,
            payload.path,
            payload.name,
            payload.content,
          );
          break;

        case Events.GET_TREE:
          await getTree(ws, payload.path);
          break;

        case Events.DELETE_FILE:
          await deleteFileHandler(ws, payload.path, payload.name);
          break;

        case Events.CREATE_FOLDER:
          await createFolderHandler(ws, payload.path, payload.name);
          break;

        case Events.DELETE_FOLDER:
          await deleteFolderHandler(ws, payload.path, payload.name);
          break;

        // case Events.TERMINAL_CREATE:
        //   break;

        case Events.TERMINAL_INPUT:
          terminal.write(payload.data);
          break;

        case Events.TERMINAL_RESIZE:
          terminal.resize(payload.cols, payload.rows);
          break;

        default:
          ws.send(
            JSON.stringify({
              requestId,
              event: Events.ERROR,
              payload: {
                message: "Unknown event",
              },
            }),
          );
      }
    } catch (error) {
      console.log({ error });
      ws.send(
        JSON.stringify({
          event: Events.ERROR,
          payload: {
            message: error instanceof Error ? error.message : "Unknown error",
          },
        }),
      );
    }
  });
}
