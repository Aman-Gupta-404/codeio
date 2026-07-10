"use client";

import { FileCode2 } from "lucide-react";

export default function NoFile() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background">
      <div className="rounded-full border bg-muted/40 p-4">
        <FileCode2 className="h-8 w-8 text-muted-foreground" />
      </div>

      <h2 className="mt-6 text-lg font-semibold">No file selected</h2>

      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        Select a file from the explorer to start viewing or editing its
        contents.
      </p>
    </div>
  );
}
