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
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Icon } from "@iconify/react";

// TODO: This is something that should be loaded from Backend
const languages = [
  { emoji: "🐍", icon: "material-icon-theme:python", name: "Python" },
  { emoji: "🟢", icon: "material-icon-theme:nodejs", name: "Node" },
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
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("Python");

  const router = useRouter();

  const handleCreateProject = async () => {
    try {
      setLoading(true);
      const res = await projectsApi.createProject({
        title: projName,
        language: selectedLang,
      });
      console.log({ res });
      if (res.status === 201) {
        toast.success("Project creaated");
        router.push(`/projects/${res.data.projectId}`);
      } else {
        toast.error(res.data.error || "Error in creating project");
      }
      onOpenChange;
    } catch (error: any) {
      console.log({ error });
      toast.error(error?.message || "Error in creating project");
    } finally {
      setLoading(false);
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
              placeholder="e.g. My fast api service"
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
                    flex flex-col justify-center items-center gap-2
                    rounded-lg border p-3 transition
                    hover:bg-accent
                    ${
                      selectedLang === lang.name
                        ? "border-primary bg-primary/10"
                        : ""
                    }
                  `}
                >
                  <Icon icon={lang.icon} width={30} height={30} />
                  {/* <span className="block text-xl">
                  </span> */}

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

          <Button onClick={handleCreateProject} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
