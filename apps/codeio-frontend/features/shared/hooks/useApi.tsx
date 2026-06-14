import { useAuth } from "@clerk/nextjs";
import React from "react";

function useApi() {
  const { getToken } = useAuth();

  async function callApi<T>(apiFn: (token: string) => Promise<T>): Promise<T> {
    const token = await getToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    return apiFn(token);
  }

  return {};
}

export default useApi;
