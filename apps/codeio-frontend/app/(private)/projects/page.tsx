"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Play,
  Loader2,
  ExternalLink,
  SquarePause,
  GitBranchIcon,
} from "lucide-react";
import { Icon } from "@iconify/react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/features/projects/types";
import { projectsApi } from "@/apis/projects/projects.api";
import { ProjectOptions } from "@/features/projects/components/projectOptions";
import { CreateProjectModal } from "@/features/projects/modals/create-project-modal";
import { notFound, useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { usePolling } from "@/features/shared/hooks/usePolling";
import { AxiosResponse } from "axios";
import { ProjectStatusResponse } from "@/apis/projects/projects.types";

type StatusLoadingtype = {
  loading: boolean;
  projectIds: string[];
};

export default function ProjectsPage() {
  const [openCreateProject, setOpenCreateProject] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [fetching, setFetching] = useState(false);
  // const [statusLoading, setStatusLoading] = useState<StatusLoadingtype>({
  //   loading: true,
  //   projectIds: [],
  // });
  const [statusLoading, setStatusLoading] = useState<string[]>([]);

  const router = useRouter();

  const { data, poll, stop } = usePolling<AxiosResponse<ProjectStatusResponse>>(
    {
      interval: 10000,
    },
  );

  const getDeleteStatus = async ({ projectId }: { projectId: string }) => {
    return await projectsApi.getProjectStatus({
      action: "stopping",
      projectId,
    });
  };

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

  const handlePlayProject = async (projectId: string) => {
    if (!projectId) {
      toast.error("No project found");
    }
    try {
      setStatusLoading((p) => [...p, projectId]);

      const eligibility = await projectsApi.getRunProjectEligibility();
      if (eligibility.status === 200 && eligibility.data.eligible) {
        router.push(`/projects/${projectId}`);
      } else {
        toast.error("Please stop other workspaces to run this project!");
      }
    } catch (error: any) {
      toast.error(
        error?.message || "Error in running the project, please try again",
      );
    } finally {
      setStatusLoading((p) => p.filter((id) => id !== projectId));
    }
  };

  const handleStopProject = async (projectId: string) => {
    if (!projectId) {
      toast.error("No project found");
    }

    setStatusLoading((p) => [...p, projectId]);
    try {
      const res = await projectsApi.runProject({ projectId, status: "stop" });
      if (res.status === 200) {
        const d = res.data;
        // if (d.status === "down") {
        //   toast.success("Project stopped successfully!");
        //   setProjects((p) =>
        //     p.map((item) => {
        //       if (item.id !== projectId) return item;
        //       return { ...item, status: "stopped" };
        //     }),
        //   );
        // }
        poll(getDeleteStatus, { projectId });
      } else {
        setStatusLoading((p) => p.filter((id) => id !== projectId));
        toast.error(res?.data?.error || "Error in stopping the project");
      }
    } catch (error: any) {
      setStatusLoading((p) => p.filter((id) => id !== projectId));

      toast.error(error?.message || "Error in stopping the project");
    }
    // finally {
    //   setStatusLoading({ loading: false, projectId: null });
    // }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // handle the project status api outputs
  useEffect(() => {
    if (!data) return;

    if (data.status !== 200) {
      stop();
      toast.error("Error in running project");
      notFound();
    }

    const statusData = data.data;
    if (statusData.status === "deleted") {
      const projectId = data.data.projectId;
      // the project is running
      setProjects((p) =>
        p.map((item) => {
          if (item.id !== projectId) return item;
          return { ...item, status: "stopped" };
        }),
      );

      setStatusLoading((p) => p.filter((id) => id !== projectId));

      toast.success("Project stopped successfully!");
      stop();
    }
  }, [data, stop]);

  return (
    <div className="relative w-full px-6 py-6 lg:px-8 mt-[56px] max-w-7xl mx-auto">
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

      {/* filters section, removed for now */}
      {/* <Card className="mb-4">
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
      </Card> */}

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
                    {/* <GitBranchIcon className="h-5 w-5 text-primary" /> */}
                    <Icon
                      className="h-5 w-5 text-primary"
                      icon={
                        project.language === "node"
                          ? "vscode-icons:file-type-node"
                          : "material-icon-theme:python"
                      }
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {project.title}
                    </div>

                    <div className="truncate text-xs text-muted-foreground">
                      Created On: {formatDate(project.createdAt)}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="hidden items-center gap-3 md:flex">
                    <Badge variant="secondary">{project.language}</Badge>

                    <div className="text-sm text-muted-foreground">
                      {project.updated}
                    </div>

                    {statusLoading.includes(project.id) ? (
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
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={
                            statusLoading.includes(project.id) ||
                            project.status !== "running"
                          }
                          onClick={() => {
                            router.push(`/projects/${project.id}`);
                          }}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>

                      <TooltipContent>
                        <p>
                          {project.status === "running"
                            ? "Open Project"
                            : "Start the project to run it"}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="cursor-pointer"
                          disabled={statusLoading.includes(project.id)}
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
