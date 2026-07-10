import { Events } from "@/data/events";
import React, { useCallback, useEffect, useState } from "react";
import {
  ConnectionStatusTypes,
  FileNode,
  SelectedFileState,
} from "../../types";
import {
  insertNode,
  normalizePath,
  removeNode,
  updateNodeStatus,
} from "../utils/helper";
import { toast } from "sonner";

interface Props {
  connectionStatus: ConnectionStatusTypes;
}

type TerminalListener = (data: string) => void;

const terminalListeners = new Set<TerminalListener>();

function useProjectData() {
  const [fileTree, setFileTree] = useState<{
    tree: FileNode[];
    loading: boolean;
  }>({ loading: true, tree: [] });
  const [terminalOutput, setTerminalOutput] = useState("");
  const [selectedFile, setSelectedFile] = useState<SelectedFileState>({
    path: null,
    content: null,
  });

  const handleMessage = useCallback(
    (message: any, connectionStatus: ConnectionStatusTypes) => {
      //   console.log({ message });
      switch (message.event) {
        case Events.GET_TREE:
          setFileTree({ loading: false, tree: message.payload.tree });
          break;

        case Events.CREATE_FOLDER:
          if (message.status === "success") {
            // update the particular file/folder status
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              updateNodeStatus(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "folder",
                false,
              );

              return {
                loading: false,
                tree,
              };
            });
          } else {
            // remove the particular file/folder and show alert
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              removeNode(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "folder",
              );

              return {
                loading: false,
                tree,
              };
            });
            toast.error(
              `Error in creating the folder ${message?.payload?.name}`,
            );
          }
          break;

        case Events.CREATE_FILE:
          if (message.status === "success") {
            // update the particular file/folder status
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              updateNodeStatus(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "file",
                false,
              );

              return {
                loading: false,
                tree,
              };
            });
          } else {
            // remove the particular file/folder and show alert
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              removeNode(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "file",
              );

              return {
                loading: false,
                tree,
              };
            });
            toast.error(`Error in creating the file ${message?.payload?.name}`);
          }
          break;

        case Events.READ_FILE:
          if (message.status === "success") {
            // update the current file
            setSelectedFile((p) => ({
              ...p,
              content: message.payload.content,
            }));
            console.log({ message });
          } else {
            // remove the particular file/folder and show alert
            setSelectedFile((p) => ({ ...p, error: true }));
            toast.error(`Error in fetching the file`);
          }
          break;

        case Events.DELETE_FILE:
          if (message.status === "success") {
            // update the particular file/folder status
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              removeNode(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "file",
              );

              return {
                loading: false,
                tree,
              };
            });
          } else {
            // remove the particular file/folder and show alert
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              updateNodeStatus(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "file",
                false,
              );

              return {
                loading: false,
                tree,
              };
            });
            toast.error(`Error in deleting the file ${message?.payload?.name}`);
          }
          break;

        case Events.DELETE_FOLDER:
          if (message.status === "success") {
            // update the particular file/folder status
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              removeNode(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "folder",
              );

              return {
                loading: false,
                tree,
              };
            });
          } else {
            // remove the particular file/folder and show alert
            setFileTree((prev) => {
              const tree = structuredClone(prev.tree);

              updateNodeStatus(
                tree,
                message?.payload.path,
                message?.payload?.name,
                "folder",
                false,
              );

              return {
                loading: false,
                tree,
              };
            });
            toast.error(
              `Error in deleting the folder ${message?.payload?.name}`,
            );
          }
          break;

        case Events.TERMINAL_OUTPUT:
          // setTerminalOutput(message?.payload?.data || "");
          terminalListeners.forEach((listener) => {
            listener(message?.payload?.data);
          });
          break;

        default:
          console.warn("Unhandled message", message);
      }
    },
    [],
  );

  // tree handler functions
  const createNode = useCallback(
    (path: string, name: string, type: "folder" | "file") => {
      const parentPath = normalizePath(path);

      const newNode: FileNode = {
        name,
        type,
        ...(type === "folder" ? { children: [] } : {}),
        ...(type === "file" ? { ext: name.split(".").pop() } : {}),
        parentPath: parentPath,
        path: parentPath ? `${parentPath}/${name}` : name,
        // path: path === "" ? name : `${path}/${name}`,
        isLoading: true,
      };

      setFileTree((prev) => {
        // Clone the tree so React sees a new reference
        const tree = structuredClone(prev.tree);

        if (parentPath === "") {
          tree.push(newNode);
        } else {
          const inserted = insertNode(tree, parentPath, newNode);

          if (!inserted) {
            console.warn("Parent folder not found:", parentPath);
            return prev;
          }
        }

        return {
          loading: false,
          tree,
        };
      });
    },
    [fileTree],
  );

  const initializeDeleteNode = useCallback(
    (path: string, name: string, type: "folder" | "file") => {
      const normalizedPath = normalizePath(path);
      console.log({ normalizedPath, name, type });
      setFileTree((prev) => {
        const tree = structuredClone(prev.tree);

        updateNodeStatus(tree, normalizedPath, name, type, true);

        return {
          loading: false,
          tree,
        };
      });
    },
    [fileTree],
  );

  const handleSelectFile = (path: string) => {
    setSelectedFile({ path, content: null });
  };

  const subscribeTerminal = useCallback((listener: TerminalListener) => {
    terminalListeners.add(listener);

    return () => {
      terminalListeners.delete(listener);
    };
  }, []);

  return {
    handleMessage,
    selectedFile,
    terminalOutput,
    actions: {
      createNode,
      handleSelectFile,
      subscribeTerminal,
      initializeDeleteNode,
    },
    fileTree,
  };
}

export default useProjectData;
