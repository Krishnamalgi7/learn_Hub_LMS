import axios from "axios";

/**
 * Legacy axios instance — prefer `apiClient` from `./client` (auth, refresh, credentials).
 * Same base URL resolution as `client.ts`.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export const getSubjects = () => api.get("/subjects");
export const getSubjectTree = (id: string) => api.get(`/subjects/${id}/tree`);
export const getVideo = (id: string) => api.get(`/videos/${id}`);
export const postVideoProgress = (id: string, data: { progress: number; completed: boolean }) =>
  api.post(`/progress/videos/${id}`, data);

export default api;
