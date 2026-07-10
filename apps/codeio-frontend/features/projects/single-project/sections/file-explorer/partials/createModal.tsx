"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

// TODO: This is something that should be loaded from Backend
const languages = [
  { emoji: "🐍", name: "Python" },
  { emoji: "🟢", name: "Node" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "folder" | "file";
  path: string;
  onCreateFolder: (path: string, name: string) => void;
  onCreateFile: (path: string, name: string) => void;
}

export function CreateFileFolderModal({
  open,
  onOpenChange,
  type,
  onCreateFolder,
  onCreateFile,
  path,
}: Props) {
  const [name, setName] = useState("");

  const handleCreate = async () => {
    try {
      if (type === "folder") onCreateFolder(path, name);
      else if (type === "file") onCreateFile(path, name);
      else toast.error("Invalid creation method!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || `Error in creating ${type}`);
    }
  };

  useEffect(() => {
    return () => setName("");
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col gap-2">
        <DialogHeader>
          <DialogTitle className="text-transform: capitalize">
            Create {type}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-2">
          {/* File / Folder Name */}
          <div className="space-y-2 flex flex-col gap-1">
            <label className="text-sm font-medium text-transform: capitalize">
              {type} Name
            </label>

            <Input
              placeholder="index.js"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <p>
            {name !== "" && (path === "" ? `./${name}` : `./${path}/${name}`)}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleCreate}>Create {type}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
