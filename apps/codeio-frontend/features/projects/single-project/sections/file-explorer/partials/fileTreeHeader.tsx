import {
  FilePlus2,
  FolderPlus,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface FileTreeHeaderProps {
  workspace: string;
  onCreateFile: () => void;
  onCreateFolder: () => void;
}

export function FileTreeHeader({
  workspace = "Workspace",
  onCreateFile,
  onCreateFolder,
}: FileTreeHeaderProps) {
  return (
    <div className="flex h-10 items-center justify-between border-b px-2">
      <div className="flex items-center gap-1 overflow-hidden">
        <ChevronDown className="size-4 text-muted-foreground" />

        <span className="truncate text-sm font-semibold">{workspace}</span>
      </div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onCreateFile}
        >
          <FilePlus2 className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onCreateFolder}
        >
          <FolderPlus className="size-4" />
        </Button>

        <Button variant="ghost" size="icon" className="size-7">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}
