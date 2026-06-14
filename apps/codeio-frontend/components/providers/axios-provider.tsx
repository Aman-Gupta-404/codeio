// providers/AxiosProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { axiosInstance } from "@/lib/axios";

export function AxiosProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await getToken();
        console.log({ token });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
    );

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, [getToken]);

  return <>{children}</>;
}
