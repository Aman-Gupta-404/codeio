import { axiosInstance } from "./axios";

export const apiClient = {
  get: <T>(url: string, params?: any) => axiosInstance.get<T>(url, { params }),

  post: <T>(url: string, data?: any) => axiosInstance.post<T>(url, data),

  put: <T>(url: string, data?: any) => axiosInstance.put<T>(url, data),

  patch: <T>(url: string, data?: any) => axiosInstance.patch<T>(url, data),

  delete: <T>(url: string) => axiosInstance.delete<T>(url),
};
