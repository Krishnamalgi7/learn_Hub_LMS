import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./config/cors";
import { loggerMiddleware } from "./middleware/logger.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import routes from "./routes";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(corsMiddleware);
  app.use(express.json());
  app.use(cookieParser());
  app.use(loggerMiddleware);

  app.use("/api", routes);

  app.use(errorMiddleware);

  return app;
};

