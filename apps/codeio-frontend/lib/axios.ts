import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  // baseURL: "http://localhost:3001",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const { getToken } = useAuth();
//     const token = getToken();
//     console.log({ token });
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => ({
    ...response.data,
    status: response.status,
    statusText: response.statusText,
  }),
  (error) => {
    // global error handling
    if (error.response?.status === 401) {
      console.error("Unauthorized");
      //TODO: optionally redirect to login
    }

    return Promise.reject(error.response?.data || error.message);
  },
);
