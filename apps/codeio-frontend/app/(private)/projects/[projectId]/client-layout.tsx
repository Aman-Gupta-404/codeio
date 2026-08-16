"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageLoader } from "@/features/shared/components/pageLoader";
import { ProjectProvider } from "@/features/projects/single-project/context/project-context";
import { toast } from "sonner";
import { AxiosResponse } from "axios";
import { notFound } from "next/navigation";
import { projectsApi } from "@/apis/projects/projects.api";
import { ProjectStatusResponse } from "@/apis/projects/projects.types";
import { usePolling } from "@/features/shared/hooks/usePolling";
import { ConfirmActivityModal } from "@/features/projects/modals/confirm-activity-modal";
import { useUserActivity } from "@/features/projects/single-project/hooks/useUserActivity";

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

  const { showInactivityModal, continueSession } = useUserActivity({
    projectId,
    loading,
  });

  const { data, poll, stop } = usePolling<AxiosResponse<ProjectStatusResponse>>(
    {
      interval: 10000,
    },
  );

  const getProjectStatus = async ({ projectId }: { projectId: string }) => {
    return await projectsApi.getProjectStatus({
      action: "starting",
      projectId,
    });
  };

  const runProject = async () => {
    if (!projectId) {
      toast.error("No project found");
    }

    setLoading(true);
    try {
      const res = await projectsApi.runProject({ projectId, status: "run" });
      if (res.status === 200) {
        const d = res.data;

        setProjectDetails({
          language: d.project.language,
          title: d.project.title,
          status: "starting",
          wsUrl: "",
          token: "",
        });

        // start the polling
        poll(getProjectStatus, { projectId });
      } else {
        setLoading(false);
        toast.error(res?.data?.error || "Couldn't fetch the project");
        notFound();
      }
    } catch (error: any) {
      toast.error(error?.message || "Couldn't fetch the project");
      setLoading(false);
      notFound();
    }
  };

  //   fetch the prject data
  useEffect(() => {
    runProject();
  }, [projectId]);

  // handle the project status api outputs
  useEffect(() => {
    if (!data) return;

    if (data.status !== 200) {
      stop();
      toast.error("Error in running project");
      notFound();
    }
    const statusData = data.data;
    if (statusData.status === "running") {
      // the project is running

      setLoading(false);
      setProjectDetails((p) => {
        if (p)
          return {
            ...p,
            status: "running",
            wsUrl: statusData.wsUrl,
            token: statusData.token,
          };
        return p;
      });

      toast.success("Project environment created");
      stop();
    }
  }, [data, stop]);

  return (
    <>
      {projectId && <PageLoader isLoading={loading} />}
      {projectDetails && projectDetails.status === "running" && (
        <ProjectProvider
          projectId={projectId}
          showInactiveModal={showInactivityModal}
          wsUrl={`${projectDetails?.wsUrl}?token=${projectDetails.token}`}
        >
          {children}
        </ProjectProvider>
      )}

      {/* modals */}
      <ConfirmActivityModal
        open={showInactivityModal}
        onOpenChange={(val: boolean) => {}}
        projectId={projectId}
        handleIsActive={continueSession}
      />
    </>
  );
}
