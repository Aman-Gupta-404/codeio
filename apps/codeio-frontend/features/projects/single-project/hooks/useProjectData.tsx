import { Events } from "@/data/events";
import { debounce } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { projectsApi } from "@/apis/projects/projects.api";

type TerminalListener = (data: string) => void;

const terminalListeners = new Set<TerminalListener>();

const LAST_ACTIVITY_INTERVAL = 5 * 60 * 1000; // 5 min

interface Props {
  projectId: string;
}

function useProjectData({ projectId }: Props) {
  const [fileTree, setFileTree] = useState<{
    tree: FileNode[];
    loading: boolean;
  }>({ loading: true, tree: [] });
  const [terminalOutput, setTerminalOutput] = useState("");
  const [userInactiveModal, setUserInactiveModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFileState>({
    path: null,
    content: null,
  });

  const lastUpdatedRef = useRef(0);
  const userActiveRef = useRef(true);

  // const updateProjectActivity = useCallback(async () => {
  //   await projectsApi.updateProjectActivity(projectId);
  // }, [projectId]);

  // const updateProjectActivity = useMemo(() => {
  //   return debounce(async (type: "auto" | "manual" = "auto") => {
  //     console.log("here 1.1: ", { type });
  //     console.log("here 2");
  //     const now = Date.now();

  //     if (
  //       type === "auto" &&
  //       now - lastUpdatedRef.current < LAST_ACTIVITY_INTERVAL
  //     ) {
  //       console.log("here 3");
  //       return;
  //     }

  //     console.log("here 4");

  //     try {
  //       const res = await projectsApi.updateProjectActivity(projectId);
  //       console.log({ res });
  //       setUserInactiveModal(false);
  //       userActiveRef.current = false;
  //       lastUpdatedRef.current = now;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }, 1000);
  // }, [projectId]);

  // useEffect(() => {
  //   return () => {
  //     updateProjectActivity.cancel();
  //   };
  // }, [updateProjectActivity]);

  const handleMessage = useCallback(
    (message: any, connectionStatus: ConnectionStatusTypes) => {
      // updateProjectActivity(); // when ever the pod send back a message, update the activity
      userActiveRef.current = true;
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

  useEffect(() => {
    setInterval(() => {
      if (userInactiveModal) return;
      if (userActiveRef.current === false) {
        // show pop-up modal
        setUserInactiveModal(true);
      } else {
        userActiveRef.current = false;
      }
      // }, 60000);
    }, 30000);
  }, []);

  return {
    handleMessage,
    selectedFile,
    terminalOutput,
    userInactiveModal,
    actions: {
      createNode,
      handleSelectFile,
      subscribeTerminal,
      initializeDeleteNode,
      updateProjectActivity: () => {},
    },
    fileTree,
  };
}

export default useProjectData;
