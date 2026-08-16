import { useCallback, useEffect, useRef, useState } from "react";

interface UsePollingOptions {
  interval?: number;
}

export function usePolling<T>({ interval = 3000 }: UsePollingOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const stop = useCallback(() => {
    stoppedRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async <P,>(fetcher: (params: P) => Promise<T>, params: P) => {
      stoppedRef.current = false;

      const run = async () => {
        if (stoppedRef.current) return;

        setLoading(true);

        try {
          const result = await fetcher(params);
          setData(result);
        } finally {
          setLoading(false);
        }

        if (!stoppedRef.current) {
          timeoutRef.current = setTimeout(run, interval);
        }
      };

      void run();
    },
    [interval],
  );

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    data,
    loading,
    poll,
    stop,
  };
}
