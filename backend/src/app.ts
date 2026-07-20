import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
    }),
  );
  app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(express.json());

  app.use("/api", healthRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
