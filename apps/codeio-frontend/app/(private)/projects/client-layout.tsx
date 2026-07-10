"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "@/features/shared/components/pageLoader";
import { ProjectProvider } from "@/features/projects/single-project/context/project-context";
import { toast } from "sonner";
import { notFound } from "next/navigation";
import { projectsApi } from "@/apis/projects/projects.api";

interface Props {
  children: React.ReactNode;
  projectId: string;
}

type ProjectDetailsType = {
  language: string;
  status: string;
  title: string;
  wsUrl: string;
  token: string;
};

export default function ClientLayout({ children, projectId }: Props) {
  const [loading, setLoading] = useState(false);
  const [projectDetails, setProjectDetails] =
    useState<ProjectDetailsType | null>(null);

  const runProject = async () => {
    if (!projectId) {
      toast.error("No project found");
    }

    setLoading(true);
    try {
      const res = await projectsApi.runProject({ projectId });
      if (res.status === 200) {
        const d = res.data;

        setProjectDetails({
          language: d.project.language,
          status: d.project.status,
          title: d.project.title,
          wsUrl: d.wsUrl,
          token: d.token,
        });
      } else {
        toast.error(res?.data?.error || "Couldn't fetch the project");
        notFound();
      }
      console.log({ res });
    } catch (error: any) {
      toast.error(error?.message || "Couldn't fetch the project");
      notFound();
    } finally {
      setLoading(false);
    }
  };

  //   fetch the prject data
  useEffect(() => {
    runProject();
  }, [projectId]);

  return (
    <>
      {!projectId && (
        <PageLoader isLoading={loading} message="Preparing your workspace..." />
      )}
      {projectDetails && (
        <ProjectProvider
          projectId={projectId}
          wsUrl={`${projectDetails?.wsUrl}?token=${projectDetails.token}`}
        >
          {children}
        </ProjectProvider>
      )}
    </>
  );
}
