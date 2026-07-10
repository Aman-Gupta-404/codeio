"use client";

import {
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
} from "react";
import { toast } from "sonner";

import {
  FileNode,
  SelectedFileState,
  ConnectionStatusTypes,
} from "../../types";
import { Events } from "@/data/events";
import useProjectData from "../hooks/useProjectData";
import { useProjectSocket } from "../hooks/useProjectSocket";
import { getFileFromPath, nodeExists } from "../utils/helper";

type TerminalListener = (data: string) => void;

type Context = {
  fetchParentTree: () => void;
  currentFile: SelectedFileState;
  send: (message: unknown) => void;
  selectFile: (path: string) => void;
  terminalData: string;
  writeTerminal: (data: string) => void;
  connectionStatus: ConnectionStatusTypes;
  updateFileContent: (content: string) => void;
  fileTree: { loading: boolean; tree: FileNode[] };
  createFile: (path: string, name: string) => void;
  createFolder: (path: string, name: string) => void;
  resizeTerminal: (cols: number, rows: number) => void;
  subscribeTerminal(listener: TerminalListener): () => void;
  deleteNode: (path: string, name: string, type: "file" | "folder") => void;
};

const ProjectContext = createContext<Context | null>(null);

/**
 * Project Context Provider
 */
export function ProjectProvider({
  children,
  projectId,
  wsUrl,
}: {
  children: React.ReactNode;
  projectId: string;
  wsUrl: string;
}) {
  const [currFIle, setCurrFile] = useState<{
    content: string | null;
    path: string | null;
  }>({
    content: null,
    path: null,
  });

  const {
    handleMessage,
    actions: projectDataActions,
    ...projectData
  } = useProjectData();

  const { send, connectionStatus } = useProjectSocket({
    projectId,
    onMessage: handleMessage,
    url: wsUrl,
  });

  // -------- functions definitions to fetch all data and export them via context --------

  /**
   * Fetch the folder tree structure for the parent folder of project
   */
  const fetchParentTree = useCallback(() => {
    send({
      event: Events.GET_TREE,
      payload: {
        path: "",
      },
    });
  }, []);

  const createFolder = useCallback(
    (path: string, name: string) => {
      if (projectData.fileTree.loading === true || !projectData.fileTree.tree) {
        toast.error("Project directory not found");
        return;
      }

      // check if folder/file already exists
      const newPath = `/${path}/${name}`;

      if (nodeExists(projectData.fileTree.tree, newPath)) {
        toast.error("Folder already exists!");
        return;
      }

      // create a dummy node
      projectDataActions.createNode(path, name, "folder");
      // insert
      send({
        event: Events.CREATE_FOLDER,
        payload: {
          path: path,
          name: name,
        },
      });
    },
    [projectData.fileTree],
  );

  const createFile = useCallback(
    (path: string, name: string) => {
      if (projectData.fileTree.loading === true || !projectData.fileTree.tree) {
        toast.error("Project directory not found");
        return;
      }

      // check if folder/file already exists
      const newPath = `/${path}/${name}`;

      if (nodeExists(projectData.fileTree.tree, newPath)) {
        toast.error("file already exists!");
        return;
      }

      // create a dummy node
      projectDataActions.createNode(path, name, "file");
      // insert
      send({
        event: Events.CREATE_FILE,
        payload: {
          path: path,
          name: name,
        },
      });
    },
    [projectData.fileTree],
  );

  const deleteNode = useCallback(
    (path: string, name: string, type: "file" | "folder") => {
      if (projectData.fileTree.loading === true || !projectData.fileTree.tree) {
        toast.error("Project directory not found");
        return;
      }

      // check if folder/file already exists
      const currPath = `/${path}/${name}`;

      if (!nodeExists(projectData.fileTree.tree, currPath)) {
        toast.error(`${type} does not exists!`);
        return;
      }

      // create a dummy node
      projectDataActions.initializeDeleteNode(path, name, type);
      // // insert
      send({
        event: type === "folder" ? Events.DELETE_FOLDER : Events.DELETE_FILE,
        payload: {
          path: path,
          name: name,
        },
      });
    },
    [projectData.fileTree],
  );

  /**
   * Fetch the project file based on the path
   *  @param path - Path of the file to fetch.
   */
  const fetchFile = useCallback((path: string) => {
    send({
      event: Events.READ_FILE,
      payload: {
        path: path,
      },
    });
  }, []);

  const updateFileContent = useCallback(
    (content: string) => {
      if (!projectData.selectedFile.path) return;
      const path = projectData.selectedFile.path;
      const name = getFileFromPath(projectData.selectedFile.path);
      send({
        event: Events.WRITE_FILE,
        payload: {
          path: path,
          name,
          content,
        },
      });
    },
    [projectData.selectedFile],
  );

  // -------- Socket related functions --------
  const resizeTerminal = useCallback((cols: number, rows: number) => {
    send({
      event: Events.TERMINAL_RESIZE,
      payload: {
        cols,
        rows,
      },
    });
  }, []);

  const writeTerminal = (input: string) => {
    send({
      event: Events.TERMINAL_INPUT,
      payload: { data: input },
    });
  };

  // -------- Fetch all required Initial data of the project --------
  useEffect(() => {
    if (connectionStatus === "connected") {
      fetchParentTree();
    }
  }, [connectionStatus]);

  useEffect(() => {
    if (projectData.selectedFile.path) {
      fetchFile(projectData.selectedFile.path);
    }
  }, [projectData.selectedFile.path]);

  return (
    <ProjectContext.Provider
      value={{
        subscribeTerminal: projectDataActions.subscribeTerminal,
        selectFile: projectDataActions.handleSelectFile,
        terminalData: projectData.terminalOutput,
        currentFile: projectData.selectedFile,
        fileTree: projectData.fileTree,
        updateFileContent,
        connectionStatus,
        fetchParentTree,
        resizeTerminal,
        writeTerminal,
        createFolder,
        createFile,
        deleteNode,
        send,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

/**
 * Project Context Hook
 */
export function useProject() {
  const ctx = useContext(ProjectContext);

  if (!ctx) {
    throw new Error("useProject must be used inside ProjectProvider");
  }

  return ctx;
}
