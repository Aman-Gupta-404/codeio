import { projectsApi } from "@/apis/projects/projects.api";
import { useCallback, useEffect, useRef, useState } from "react";

const HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute
// const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const THROTTLE_MS = 1000; // Ignore excessive mousemove events

export const useUserActivity = ({
  projectId,
  loading,
}: {
  projectId: string;
  loading: boolean;
}) => {
  const [showInactivityModal, setShowInactivityModal] = useState(false);

  // Timestamp of the user's last activity
  const lastActivityRef = useRef(Date.now());

  // Timer for inactivity
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Used to throttle activity events
  const lastProcessedActivityRef = useRef(0);

  /**
   * heartbeat API
   */
  const sendHeartbeat = useCallback(async () => {
    try {
      if (loading) return;

      await projectsApi.updateProjectActivity(projectId);
      // await api.post("/heartbeat");
    } catch (err) {
      console.error(err);
    }
  }, [projectId]);

  /**
   * Starts/resets the inactivity timer
   */
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    inactivityTimeoutRef.current = setTimeout(() => {
      setShowInactivityModal(true);
    }, INACTIVITY_TIMEOUT);
  }, []);

  /**
   * Called whenever user performs an activity
   */
  const handleActivity = useCallback(() => {
    const now = Date.now();

    // Throttle high-frequency events like mousemove
    if (now - lastProcessedActivityRef.current < THROTTLE_MS) {
      return;
    }

    lastProcessedActivityRef.current = now;
    lastActivityRef.current = now;

    // If modal is already open, don't automatically close it.
    // Let the user explicitly confirm.
    resetInactivityTimer();
  }, [resetInactivityTimer]);

  /**
   * User clicked "Continue Session"
   */
  const continueSession = useCallback(async () => {
    setShowInactivityModal(false);

    lastActivityRef.current = Date.now();

    resetInactivityTimer();

    await sendHeartbeat();
  }, [resetInactivityTimer, sendHeartbeat]);

  /**
   * Register activity listeners
   */
  useEffect(() => {
    if (loading) return;

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) =>
      window.addEventListener(event, handleActivity, {
        passive: true,
      }),
    );

    resetInactivityTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );

      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [handleActivity, resetInactivityTimer, loading]);

  /**
   * Heartbeat interval
   */
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      const inactiveFor = Date.now() - lastActivityRef.current;

      // Only ping if the user isn't already inactive
      if (inactiveFor < INACTIVITY_TIMEOUT && !showInactivityModal) {
        sendHeartbeat();
      }
    }, HEARTBEAT_INTERVAL);

    return () => clearInterval(interval);
  }, [showInactivityModal, sendHeartbeat, loading]);

  return {
    showInactivityModal,
    continueSession,
  };
};
