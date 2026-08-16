"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConnectionStatusTypes } from "../../types";

type Status = "connecting" | "connected" | "disconnected";

type Options = {
  url: string;
  projectId: string;
  onMessage: (message: any, connectionStatus: ConnectionStatusTypes) => void;
};

const MAX_RETRIES = 10;
const MAX_DELAY = 30000;

export function useProjectSocket({ projectId, onMessage, url }: Options) {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatusTypes>("initializing");

  const wsRef = useRef<WebSocket | null>(null);

  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempts = useRef(0);

  const shouldReconnect = useRef(true);

  // TODO: Depricated, to be removed
  const [status, setStatus] = useState<Status>("connecting");

  const connect = useCallback(
    (type: "initialize" | "re-connection" = "initialize") => {
      console.log({ url });
      if (!url) return;
      setStatus("connecting");
      if (type === "initialize") setConnectionStatus("initializing");
      else if (type === "re-connection") setConnectionStatus("re-connecting");

      const ws = new WebSocket(url);

      wsRef.current = ws;

      ws.onopen = () => {
        // clear the existing timer if connected back
        if (reconnectTimeout.current) {
          clearTimeout(reconnectTimeout.current);
          reconnectTimeout.current = null;
        }

        reconnectAttempts.current = 0;

        setStatus("connected");
        setConnectionStatus("connected");

        // TODO: convert this into a simple health check
        ws.send(
          JSON.stringify({
            type: "join-project",
            projectId,
          }),
        );
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        onMessage(message, connectionStatus);
      };

      ws.onerror = (error) => {
        console.log({ error });
        ws.close();
      };

      ws.onclose = () => {
        setStatus("disconnected");
        setConnectionStatus("disconnected");

        if (!shouldReconnect.current) return;

        if (reconnectAttempts.current >= MAX_RETRIES) {
          return;
        }

        reconnectAttempts.current++;

        // Retry mechanism --> exponential delay + jitter
        const delay = Math.min(
          1000 * 2 ** reconnectAttempts.current,
          MAX_DELAY,
        );

        reconnectTimeout.current = setTimeout(() => {
          reconnectTimeout.current = null;
          connect();
        }, delay);
      };
    },
    [projectId, onMessage],
  );

  useEffect(() => {
    shouldReconnect.current = true;

    connect();

    return () => {
      shouldReconnect.current = false;

      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }

      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("Socket not connected");
      return;
    }

    ws.send(JSON.stringify(data));
  }, []);

  return {
    send,
    connectionStatus,
  };
}
