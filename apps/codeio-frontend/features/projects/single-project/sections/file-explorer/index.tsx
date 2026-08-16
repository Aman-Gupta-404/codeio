"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FilePlus2,
  FolderPlus,
  Loader2,
} from "lucide-react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { getFileMeta } from "@/lib/get-file-meta";
import { useProject } from "../../context/project-context";
import { Events } from "@/data/events";
import FileTreeSkeleton from "./partials/fileTreeSkeleton";
import FolderChildrenSkeleton from "./partials/folderChildrenSkeleton";
import EmptyFileTree from "./partials/emptyFileTree";
import { FileTreeHeader } from "./partials/fileTreeHeader";
import { CreateFileFolderModal } from "./partials/createModal";
import { Button } from "@/components/ui/button";
import { FileNode } from "@/features/projects/types";
import { NodeOptions } from "./partials/nodeOptions";
import ConfirmModal from "@/features/shared/modals/confirmModal";
import { toast } from "sonner";

type CreateModalStateType = {
  show: boolean;
  type: "folder" | "file" | null;
  path: string | null;
};

type DeleteModalStateType = {
  show: boolean;
  type: "folder" | "file" | null;
  name: string | null;
  path: string | null;
};

type FileTreeNodeProps = {
  node: FileNode;
  depth?: number;
  selected: string;
  loading: boolean;
  path: string;
  onSelect: (name: string) => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  onDeleteNode: (path: string, name: string, type: "file" | "folder") => void;
};

function FileTreeNode({
  node,
  depth = 0,
  onSelect,
  selected,
  path = "",
  loading = false,
  onCreateFile,
  onCreateFolder,
  onDeleteNode,
}: FileTreeNodeProps) {
  const [open, setOpen] = useState(false);
  const isFolder = node.type === "folder";
  const isSelected = selected === node.name;

  const fileMeta = getFileMeta(node.ext);

  const { selectFile } = useProject();

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 px-2 py-1 text-sm transition-colors",
          "hover:bg-accent/60",
          isSelected && "bg-border text-accent-foreground border-primary",
          node.isLoading && "opacity-40",
        )}
        style={{
          paddingLeft: `${depth * 14 + 8}px`,
        }}
        onClick={() => {
          if (isFolder) setOpen((o) => !o);
          else selectFile(node.path);
        }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          {isFolder ? (
            <>
              <span className="text-muted-foreground w-3 shrink-0">
                {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </span>
              {open ? (
                <FolderOpen size={14} className="text-primary shrink-0" />
              ) : (
                <Folder size={14} className="text-primary shrink-0" />
              )}
            </>
          ) : (
            <>
              <span className="w-3 shrink-0" />
              <Icon
                icon={fileMeta.icon}
                className="size-4 shrink-0"
                style={{ color: fileMeta.color }}
              />
            </>
          )}
          <span
            className={cn(
              "truncate text-sm font-mono leading-none",
              isSelected && "font-medium",
            )}
          >
            {node.name}
          </span>
        </div>

        {isFolder && !node.isLoading && (
          <div
            className="flex items-center opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="ml-auto flex items-center opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="icon"
                variant="ghost"
                className="size-6 cursor-pointer"
                onClick={() => onCreateFile(path)}
              >
                <FilePlus2 className="size-3.5" />
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className="size-6 cursor-pointer"
                onClick={() => {
                  console.log({ path });
                  onCreateFolder(path);
                }}
              >
                <FolderPlus className="size-3.5" />
              </Button>
              <NodeOptions
                onDelete={() =>
                  onDeleteNode(node.parentPath, node.name, "folder")
                }
              />
            </div>
          </div>
        )}

        {!isFolder && !node.isLoading && (
          <div
            className="flex items-center opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <NodeOptions
              onDelete={() => onDeleteNode(node.parentPath, node.name, "file")}
            />
          </div>
        )}

        {node.isLoading && (
          <div
            className="flex items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      {isFolder && open && node.children && (
        <div>
          {loading ? (
            <FolderChildrenSkeleton depth={depth} />
          ) : (
            node.children.map((child) => (
              <FileTreeNode
                node={child}
                key={child.name}
                path={child.path}
                depth={depth + 1}
                onSelect={onSelect}
                selected={selected}
                onDeleteNode={onDeleteNode}
                onCreateFile={onCreateFile}
                onCreateFolder={onCreateFolder}
                loading={Boolean(child.isLoading)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer() {
  const [selected, setSelected] = useState("page.tsx");
  const [showDeleteModal, setShowDeleteModal] = useState<DeleteModalStateType>({
    show: false,
    path: null,
    name: null,
    type: null,
  });
  const [showCreateModal, setShowCreateModal] = useState<CreateModalStateType>({
    show: false,
    type: null,
    path: null,
  });

  // project context
  const { send, fileTree, createFolder, createFile, deleteNode } = useProject();

  const onCloseCreateModal = () => {
    setShowCreateModal({
      show: false,
      type: null,
      path: null,
    });
  };

  const onCloseDeleteModal = () => {
    setShowDeleteModal({
      show: false,
      type: null,
      path: null,
      name: null,
    });
  };

  const handleDeleteNode = (
    path: string,
    name: string,
    type: "file" | "folder",
  ) => {
    setShowDeleteModal({
      show: true,
      type: type,
      path: path,
      name: name,
    });
  };

  const handleCreateFile = (path: string = "") => {
    setShowCreateModal({
      show: true,
      type: "file",
      path: path,
    });
  };

  const handleCreateFolder = (path: string = "") => {
    setShowCreateModal({
      show: true,
      type: "folder",
      path: path,
    });
  };

  const handleConfirmDelete = () => {
    if (
      showDeleteModal.path === null ||
      showDeleteModal.name === null ||
      showDeleteModal.type === null
    ) {
      toast.error("Invalid file or folder");
      return;
    }
    deleteNode(
      showDeleteModal.path,
      showDeleteModal.name,
      showDeleteModal.type,
    );
    onCloseDeleteModal();
  };

  useEffect(() => {
    send({
      event: Events.GET_TREE,
      payload: {
        path: "",
      },
    });
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* <div className="px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border shrink-0">
        Explorer
      </div> */}
      <FileTreeHeader
        workspace="workspace"
        onCreateFile={() => handleCreateFile("")}
        onCreateFolder={() => handleCreateFolder("")}
      />
      <div className="flex-1 overflow-y-auto py-1">
        {fileTree.loading ? (
          <FileTreeSkeleton />
        ) : fileTree.tree.length ? (
          fileTree?.tree.map((node: FileNode) => (
            <FileTreeNode
              node={node}
              key={node.name}
              loading={false}
              path={node.path}
              selected={selected}
              onSelect={setSelected}
              onCreateFile={handleCreateFile}
              onCreateFolder={handleCreateFolder}
              onDeleteNode={handleDeleteNode}
            />
          ))
        ) : (
          <EmptyFileTree />
        )}
      </div>

      {/* create file / folder modal */}
      <CreateFileFolderModal
        path={showCreateModal.path || ""}
        open={showCreateModal.show}
        onOpenChange={onCloseCreateModal}
        onCreateFolder={createFolder}
        onCreateFile={createFile}
        type={showCreateModal.type || "file"}
      />

      {/* confirm delete modal */}
      <ConfirmModal
        open={showDeleteModal.show}
        onOpenChange={onCloseDeleteModal}
        heading="Alert"
        message={`Are you sure you want to delete the ${showDeleteModal.name} ${showDeleteModal.type}`}
        onConfirm={handleConfirmDelete}
        confirmCta="Delete"
      />
    </div>
  );
}
