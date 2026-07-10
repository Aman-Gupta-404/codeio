import { FolderOpen } from "lucide-react";

export default function EmptyFileTree() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <FolderOpen className="size-8 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-medium">No files yet</h3>

      <p className="mt-1 max-w-[220px] text-xs text-muted-foreground">
        This workspace doesn't contain any files or folders.
      </p>
    </div>
  );
}
