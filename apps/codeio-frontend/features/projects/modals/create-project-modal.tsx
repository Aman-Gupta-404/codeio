"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectsApi } from "@/apis/projects/projects.api";
import { toast } from "sonner";

// TODO: This is something that should be loaded from Backend
const languages = [
  { emoji: "🐍", name: "Python" },
  { emoji: "🟢", name: "Node" },
];

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProjectModal({
  open,
  onOpenChange,
}: CreateProjectModalProps) {
  const [projName, setProjName] = useState("");
  const [selectedLang, setSelectedLang] = useState("Python");

  const handleCreateProject = async () => {
    try {
      const res = await projectsApi.createProject({
        title: projName,
        language: selectedLang,
      });
      toast.success("Project creaated");
      onOpenChange;
    } catch (error: any) {
      console.log({ error });
      toast.error(error?.message || "Error in creating project");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col gap-2">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-2">
          {/* Project Name */}
          <div className="space-y-2 flex flex-col gap-1">
            <label className="text-sm font-medium">Project Name</label>

            <Input
              placeholder="e.g. my-fastapi-service"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
            />
          </div>

          {/* Language */}
          <div className="space-y-2 flex flex-col gap-1">
            <label className="text-sm font-medium">Language</label>

            <div className="grid grid-cols-4 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.name}
                  type="button"
                  onClick={() => setSelectedLang(lang.name)}
                  className={`
                    rounded-lg border p-3 transition
                    hover:bg-accent
                    ${
                      selectedLang === lang.name
                        ? "border-primary bg-primary/10"
                        : ""
                    }
                  `}
                >
                  <span className="block text-xl">{lang.emoji}</span>

                  <span className="text-xs text-muted-foreground">
                    {lang.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <Button onClick={handleCreateProject}>Create Project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
