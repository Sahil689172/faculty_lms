import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { lessonRouter } from "./modules/lesson/lesson.routes.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
    }),
  );
  app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(express.json());

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/lessons", lessonRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
