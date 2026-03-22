import axios from "axios";

/** Set `VITE_API_URL` on Vercel to your Render API, e.g. `https://your-api.onrender.com/api` */
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const ACCESS_TOKEN_KEY = "lms_access_token";

const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (!token) window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  else window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout", {}, { withCredentials: true });
  } catch {
    // ignore errors
  } finally {
    setAccessToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("lms_user_role");
    }
  }
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = (config.headers ?? {}) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

const refreshAccessToken = async (): Promise<string | null> => {
  const res = await apiClient.post("/auth/refresh", {}, { withCredentials: true });
  const newToken = res.data?.accessToken as string | undefined;
  if (newToken) setAccessToken(newToken);
  return newToken ?? null;
};

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const originalRequest = err.config as (typeof err)["config"] & { _retry?: boolean };

    if (err?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Mark so we only retry once per request.
      originalRequest._retry = true;

      const isRefreshCall = originalRequest?.url?.includes("/auth/refresh");
      if (isRefreshCall) {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(err);
      }

      return (async () => {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers = originalRequest.headers || {};
            (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch {
          // ignore and redirect below
        }

        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(err);
      })();
    }

    return Promise.reject(err);
  },
);
