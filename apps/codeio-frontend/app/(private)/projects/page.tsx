"use client";

import {
  Search,
  Plus,
  MoreHorizontal,
  Play,
  GitBranchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { CreateProjectModal } from "@/features/projects/modals/create-project-modal";

const projects = [
  {
    id: 1,
    name: "AI Dashboard",
    description: "Analytics and reporting platform",
    language: "TypeScript",
    updated: "2h ago",
    status: "running",
  },
  {
    id: 2,
    name: "Internal CRM",
    description: "Customer relationship management system",
    language: "Python",
    updated: "5h ago",
    status: "idle",
  },
  {
    id: 3,
    name: "Mobile API",
    description: "Backend services for mobile applications",
    language: "Go",
    updated: "1 day ago",
    status: "running",
  },
];

export default function ProjectsPage() {
  const [openCreateProject, setOpenCreateProject] = useState(false);

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
          {projects.map((project) => (
            <div
              key={project.id}
              className="group flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
            >
              {/* Icon */}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GitBranchIcon className="h-5 w-5 text-primary" />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{project.name}</div>

                <div className="truncate text-sm text-muted-foreground">
                  {project.description}
                </div>
              </div>

              {/* Meta */}
              <div className="hidden items-center gap-3 md:flex">
                <Badge variant="secondary">{project.language}</Badge>

                <div className="text-sm text-muted-foreground">
                  {project.updated}
                </div>

                <div
                  className={`h-2 w-2 rounded-full ${
                    project.status === "running"
                      ? "bg-green-500"
                      : "bg-zinc-400"
                  }`}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button size="icon" variant="ghost">
                  <Play className="h-4 w-4" />
                </Button>

                <Button size="icon" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
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
