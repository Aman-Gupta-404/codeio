"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { projectsApi } from "@/apis/projects/projects.api";
import { toast } from "sonner";
import { notFound, useRouter } from "next/navigation";
import { Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolling } from "@/features/shared/hooks/usePolling";
import { AxiosResponse } from "axios";
import { ProjectStatusResponse } from "@/apis/projects/projects.types";

interface CreateProjectModalProps {
  open: boolean;
  projectId: string;
  onOpenChange: (open: boolean) => void;
  handleIsActive: () => void;
}

type Status = "counting" | "closing";

const TIMER = 30_000;
const RADIUS = 36;
const STROKE = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const WARNING_AT = 10; // seconds left when it switches to "urgent" styling

export function ConfirmActivityModal({
  open,
  onOpenChange,
  handleIsActive,
  projectId,
}: CreateProjectModalProps) {
  const [status, setStatus] = useState<Status>("counting");
  const [secondsLeft, setSecondsLeft] = useState(TIMER / 1000);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [processingActiveReq, setProcessingActiveReq] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const handleShutdownProject = async () => {
    if (!projectId) {
      toast.error("No project found");
      return;
    }

    setStatus("closing");
    clearTimers();

    try {
      // API call to shut down the project
      console.log("shutting down the project");

      setStatus("closing");
      const res = await projectsApi.runProject({ projectId, status: "stop" });
      if (res.status === 200) {
        const d = res.data;
        poll(getDeleteStatus, { projectId });
      } else {
        // setStatusLoading({ loading: false, projectId: null });
        toast.error(res?.data?.error || "Error in stopping the project");
        router.push("/projects");
      }
    } catch (error: any) {
      console.log({ error });
      toast.error(error?.message || "Something went wrong while closing");
      router.push("/projects");
    }
    //  finally {
    //   toast.message("Project closed due to inactivity");
    //   // onOpenChange(false);
    //   router.push("/projects");
    // }
  };

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleConfirmActive = () => {
    setProcessingActiveReq(true);
    clearTimers();
    handleIsActive();
    toast.success("Good to know — keeping things running");
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open) {
      clearTimers();
      setStatus("counting");
      return;
    }

    setStatus("counting");
    setSecondsLeft(TIMER / 1000);
    setProcessingActiveReq(false);
    const startedAt = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, Math.ceil((TIMER - elapsed) / 1000));
      setSecondsLeft(remaining);
    }, 250);

    timeoutRef.current = setTimeout(() => {
      handleShutdownProject();
    }, TIMER);

    return () => clearTimers();
  }, [open]);

  // handle the project status api outputs
  useEffect(() => {
    if (!data) return;

    if (data.status !== 200) {
      stop();
      toast.error("Error in stopping project");
      router.push("/projects");
    }

    const statusData = data.data;
    if (statusData.status === "deleted") {
      // the project is running
      router.push("/projects");

      toast.success("Project stopped successfully!");
      stop();
    }
  }, [data, stop]);

  const progress = secondsLeft / (TIMER / 1000);
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const isUrgent = secondsLeft <= WARNING_AT;
  const isClosing = status === "closing";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't let the dialog be dismissed mid-shutdown
        if (isClosing || processingActiveReq) return;
        // onOpenChange(next);
      }}
    >
      <DialogContent
        className="sm:max-w-sm overflow-hidden"
        onEscapeKeyDown={(e) => isClosing && e.preventDefault()}
        onInteractOutside={(e) => isClosing && e.preventDefault()}
        showCloseButton={false} // if your DialogContent supports this prop; otherwise remove
      >
        <DialogHeader className="items-center text-center gap-3">
          {!isClosing && (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full ring-1 transition-colors duration-300",
                isClosing
                  ? "bg-muted ring-border"
                  : isUrgent
                    ? "bg-destructive/10 ring-destructive/20"
                    : "bg-primary/10 ring-primary/20",
              )}
            >
              <Clock
                className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  isUrgent ? "text-destructive" : "text-primary",
                )}
              />
            </div>
          )}

          <DialogTitle className="text-lg">
            {isClosing ? "Closing project…" : "Still there?"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 pb-2">
          <p className="text-center text-sm text-muted-foreground max-w-[280px]">
            {isClosing
              ? "Hang tight, this usually takes just a few seconds."
              : "We haven't seen any activity on this project. Let us know you're still around, or it'll be closed automatically."}
          </p>

          <div className="relative flex h-24 w-24 items-center justify-center">
            {isClosing ? (
              <>
                <svg
                  className="absolute inset-0 animate-spin [animation-duration:1.1s]"
                  viewBox="0 0 80 80"
                >
                  {/* <circle
                    cx="40"
                    cy="40"
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    className="stroke-muted"
                  /> */}
                  <circle
                    cx="40"
                    cy="40"
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={`${CIRCUMFERENCE * 0.25} ${CIRCUMFERENCE}`}
                    className="stroke-primary"
                  />
                </svg>
                {/* <Loader2 className="h-6 w-6 text-muted-foreground animate-spin [animation-duration:1.1s]" /> */}
              </>
            ) : (
              <>
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 80 80"
                >
                  <circle
                    cx="40"
                    cy="40"
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    className="stroke-muted"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={RADIUS}
                    fill="none"
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    className={cn(
                      "transition-[stroke-dashoffset,stroke] duration-300 ease-linear",
                      isUrgent ? "stroke-destructive" : "stroke-primary",
                    )}
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "text-2xl font-semibold tabular-nums leading-none transition-colors duration-300",
                      isUrgent ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {secondsLeft}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    seconds
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {!isClosing && (
          <DialogFooter className="sm:justify-center gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={processingActiveReq}
              // onClick={() => onOpenChange(false)}
              onClick={handleShutdownProject}
            >
              Close project
            </Button>
            <Button
              className="flex-1"
              disabled={processingActiveReq}
              onClick={handleConfirmActive}
            >
              {processingActiveReq ? (
                <>processing...</>
              ) : (
                <>I&apos;m still here</>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
