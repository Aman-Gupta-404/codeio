"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  SquarePause,
  Play,
  GitBranchIcon,
  Loader2,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/features/projects/types";
import { projectsApi } from "@/apis/projects/projects.api";
import { ProjectOptions } from "@/features/projects/components/projectOptions";
import { CreateProjectModal } from "@/features/projects/modals/create-project-modal";
import { useRouter } from "next/navigation";

type StatusLoadingtype = {
  loading: boolean;
  projectId: null | string;
};

export default function ProjectsPage() {
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(false);
  const [statusLoading, setStatusLoading] = useState<StatusLoadingtype>({
    loading: false,
    projectId: null,
  });

  const router = useRouter();

  const fetchProjects = async () => {
    try {
      setFetching(true);
      const result = await projectsApi.getUsersProjects({});

      if (result.status === 200) {
        const data = result.data.data.map((p: Project & { _id: string }) => ({
          ...p,
          id: p._id,
        }));
        setProjects(data);
      } else {
        toast.error("Something went wrong, couldnt fetch the projects");
        setProjects([]);
      }
    } catch (err: any) {
      toast.error(
        err?.message || "Something went wrong, couldnt fetch the projects",
      );
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteProject = () => {
    toast.warning("Feature not yet available");
  };

  const handlePlayProject = (projectId: string) => {
    if (!projectId) {
      toast.error("No project found");
    }

    router.push(`/projects/${projectId}`);
  };

  const handleStopProject = async (projectId: string) => {
    if (!projectId) {
      toast.error("No project found");
    }

    setStatusLoading({ loading: true, projectId });
    try {
      const res = await projectsApi.runProject({ projectId, status: "stop" });
      if (res.status === 200) {
        const d = res.data;
        if (d.status === "down") {
          toast.success("Project stopped successfully!");
          setProjects((p) =>
            p.map((item) => {
              if (item.id !== projectId) return item;
              return { ...item, status: "stopped" };
            }),
          );
        }
      } else {
        toast.error(res?.data?.error || "Error in stopping the project");
      }
    } catch (error: any) {
      toast.error(error?.message || "Error in stopping the project");
    } finally {
      setStatusLoading({ loading: false, projectId: null });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="relative w-full min-h-[calc(100vh-56px)] px-6 py-6 lg:px-8 mt-[56px] max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor all your projects.
          </p>
        </div>

        <Button onClick={() => setOpenCreateProject(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input placeholder="Search projects..." className="pl-9" />
          </div>

          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              <SelectItem value="ts">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="go">Go</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="all">
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Project List */}
      <Card className="overflow-hidden p-0">
        <div className="divide-y">
          {fetching
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`${index}_index`}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  {/* Icon skeleton */}
                  <Skeleton className="h-10 w-10 rounded-lg" />

                  {/* Info skeleton */}
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>

                  {/* Meta skeleton */}
                  <div className="hidden items-center gap-3 md:flex">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                  </div>
                </div>
              ))
            : projects.map((project, i) => (
                <div
                  key={`${project.id}-${i}`}
                  className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GitBranchIcon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{project.title}</div>

                    <div className="truncate text-sm text-muted-foreground">
                      {project.slug}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="hidden items-center gap-3 md:flex">
                    <Badge variant="secondary">{project.language}</Badge>

                    <div className="text-sm text-muted-foreground">
                      {project.updated}
                    </div>

                    {statusLoading.projectId === project.id &&
                    statusLoading.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <div
                        className={`h-2 w-2 rounded-full ${
                          project.status === "running"
                            ? "bg-green-500"
                            : "bg-red-400"
                        }`}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={
                            statusLoading.projectId === project.id &&
                            statusLoading.loading
                          }
                          onClick={() => {
                            if (project.status === "running") {
                              handleStopProject(project.id);
                            } else {
                              handlePlayProject(project.id);
                            }
                          }}
                        >
                          {project.status === "running" ? (
                            <SquarePause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {project.status === "running"
                            ? "Stop the project"
                            : "Run the project"}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {/* <Button size="icon" variant="ghost"> */}
                    <ProjectOptions onDelete={handleDeleteProject} />
                    {/* </Button> */}
                  </div>
                </div>
              ))}
          {/* // TODO: Add a no content page and a CTA to create project */}
        </div>
      </Card>

      {/* modals */}
      <CreateProjectModal
        open={openCreateProject}
        onOpenChange={(val: boolean) => setOpenCreateProject(val)}
      />
    </div>
  );
}
