import { WebSocket } from "ws";
import {
  createFile,
  deleteFile,
  readFile,
  writeFile,
} from "../../filesystem/files.service";
import { buildTree } from "../../filesystem/tree.service";
import { Events } from "../../types/events";
import { createFolder, deleteFolder } from "../../filesystem/folder.service";

export const readFileHandler = async (ws: WebSocket, path: string) => {
  try {
    const content = await readFile(path);
    ws.send(
      JSON.stringify({
        event: Events.READ_FILE,
        status: "success",
        payload: {
          content: content,
        },
      }),
    );
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        status: "failure",
        event: Events.CREATE_FILE,
        message: error?.message || "Error in reading file",
        payload: {
          path: path,
        },
      }),
    );
  }
};

export const createFileHandler = async (
  ws: WebSocket,
  path: string,
  name: string,
) => {
  try {
    await createFile(path !== "" ? `${path}/${name}` : name);
    ws.send(
      JSON.stringify({
        event: Events.CREATE_FILE,
        status: "success",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        status: "failure",
        event: Events.CREATE_FILE,
        message: error?.message || "Error in creating file",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  }
};

export const writeFileHandler = async (
  ws: WebSocket,
  path: string,
  name: string,
  content: string,
) => {
  try {
    // await writeFile(path !== "" ? `${path}/${name}` : name, content);
    await writeFile(path, content);
    ws.send(
      JSON.stringify({
        event: Events.WRITE_FILE,
        status: "success",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        status: "failure",
        event: Events.WRITE_FILE,
        message: error?.message || "Error in creating file",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  }
};

export const deleteFileHandler = async (
  ws: WebSocket,
  path: string,
  name: string,
) => {
  try {
    await deleteFile(path !== "" ? `${path}/${name}` : name);
    ws.send(
      JSON.stringify({
        event: Events.DELETE_FILE,
        status: "success",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        status: "failure",
        event: Events.DELETE_FILE,
        message: error?.message || "Error in deleting file",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  }
};

export const createFolderHandler = async (
  ws: WebSocket,
  path: string,
  name: string,
) => {
  try {
    await createFolder(path !== "" ? `${path}/${name}` : name);
    ws.send(
      JSON.stringify({
        event: Events.CREATE_FOLDER,
        status: "success",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        status: "failure",
        event: Events.CREATE_FOLDER,
        message: error?.message || "Error in creating folder",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  }
};

export const deleteFolderHandler = async (
  ws: WebSocket,
  path: string,
  name: string,
) => {
  try {
    await deleteFolder(path !== "" ? `${path}/${name}` : name);
    ws.send(
      JSON.stringify({
        event: Events.DELETE_FOLDER,
        status: "success",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  } catch (error: any) {
    ws.send(
      JSON.stringify({
        status: "failure",
        event: Events.DELETE_FOLDER,
        message: error?.message || "Error in deleting folder",
        payload: {
          path: path,
          name: name,
        },
      }),
    );
  }
};

export const getTree = async (ws: WebSocket, path: string) => {
  const tree = await buildTree(path);
  ws.send(
    JSON.stringify({
      event: Events.GET_TREE,
      payload: {
        tree: tree,
      },
    }),
  );
};
