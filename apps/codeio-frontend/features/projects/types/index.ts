export interface Project {
  id: string;
  title: string;
  slug: string;
  language: string;
  updated: string;
  status: string;
}

export type FileNode = {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  ext?: string;
  parentPath: string;
  path: string;
  isLoading?: boolean;
};

export type ConnectionStatusTypes =
  | "connecting"
  | "re-connecting"
  | "disconnected"
  | "connected"
  | "initializing";

export type SelectedFileState = {
  path: string | null;
  content: string | null;
  error?: boolean;
};
