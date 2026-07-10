import { FileNode } from "../../types";

export function normalizePath(path: string): string {
  return path
    .replace(/\\/g, "/") // Windows -> POSIX
    .replace(/\/+/g, "/") // Collapse multiple slashes
    .replace(/^\/+/, "") // Remove leading slash
    .replace(/\/+$/, ""); // Remove trailing slash
}

export function nodeExists(tree: FileNode[], targetPath: string): boolean {
  const normalizedTarget = normalizePath(targetPath);

  for (const node of tree) {
    if (normalizePath(node.path) === normalizedTarget) {
      return true;
    }

    if (
      node.type === "folder" &&
      node.children &&
      nodeExists(node.children, targetPath)
    ) {
      return true;
    }
  }

  return false;
}

export function insertNode(
  tree: FileNode[],
  parentPath: string,
  newNode: FileNode,
): boolean {
  for (const node of tree) {
    if (node.type !== "folder") continue;

    if (normalizePath(node.path) === parentPath) {
      node.children ??= [];
      node.children.push(newNode);
      return true;
    }

    if (node.children && insertNode(node.children, parentPath, newNode)) {
      return true;
    }
  }

  return false;
}

export function updateNodeStatus(
  tree: FileNode[],
  path: string,
  name: string,
  type: "file" | "folder",
  loadingStatus: boolean = false,
): FileNode[] {
  const fullPath = normalizePath(`${path}/${name}`);
  console.log({ fullPath });
  for (const node of tree) {
    if (normalizePath(node.path) === fullPath && node.type === type) {
      // update the status
      console.log({
        np: normalizePath(node.path),
        fullPath,
        nt: node.type,
        type,
      });

      node.isLoading = loadingStatus;
      return tree;
    }

    if (node.children?.length) {
      updateNodeStatus(node.children, path, name, type, loadingStatus);
    }
  }

  return tree;
}

export function removeNode(
  tree: FileNode[],
  path: string,
  name: string,
  type: "file" | "folder",
): FileNode[] {
  const fullPath = normalizePath(`${path}/${name}`);

  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];

    if (normalizePath(node.path) === fullPath && node.type === type) {
      tree.splice(i, 1);
      return tree;
    }

    if (node.children?.length) {
      removeNode(node.children, path, name, type);
    }
  }

  return tree;
}

export function getFileFromPath(path: string) {
  if (!path) throw Error("No path found");

  const splitPath = path.split("/");
  const fileName = splitPath.length
    ? splitPath.length > 1
      ? splitPath.pop()
      : splitPath[0]
    : "file";

  return fileName;
}

export function getMonacoLanguage(filename: string): string {
  if (!filename) return "plaintext";

  const splitName = filename.split(".");
  if ([0, 1].includes(splitName.length)) return "plaintext";

  const extension = splitName.pop()?.toLowerCase();

  switch (extension) {
    case "ts":
      return "typescript";

    case "tsx":
      return "typescript";

    case "js":
      return "javascript";

    case "jsx":
      return "javascript";

    case "json":
      return "json";

    case "css":
      return "css";

    case "scss":
      return "scss";

    case "html":
      return "html";

    case "md":
      return "markdown";

    case "yml":
    case "yaml":
      return "yaml";

    case "xml":
      return "xml";

    case "sql":
      return "sql";

    case "py":
      return "python";

    case "java":
      return "java";

    case "go":
      return "go";

    case "rs":
      return "rust";

    case "php":
      return "php";

    case "sh":
      return "shell";

    case "dockerfile":
      return "dockerfile";

    default:
      return "plaintext";
  }
}
