import cors from "cors";

const isDev = (process.env.NODE_ENV ?? "development") !== "production";

const allowedOrigins = (process.env.CORS_ORIGINS ??
  "http://localhost:4000,http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: isDev
    ? true // In dev, reflect the requesting origin so credentials work.
    : (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
  credentials: true,
});

