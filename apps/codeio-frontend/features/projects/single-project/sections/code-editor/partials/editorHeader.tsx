"use client";

import { FileCode2, X } from "lucide-react";

export default function EditorHeader({ fileName }: { fileName: string }) {
  return (
    <div className="flex border-b bg-muted/30">
      <button
        onClick={() => console.log("Tab clicked")}
        className="group flex items-center gap-2 border-r border-border border-t-2 border-t-primary bg-background px-4 py-2 text-sm"
      >
        <FileCode2 size={15} />

        <span>{fileName || "file"}</span>

        <X size={13} className="opacity-0 transition group-hover:opacity-100" />
      </button>
    </div>
  );
}
