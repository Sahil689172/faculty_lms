import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { lessonRouter } from "./modules/lesson/lesson.routes.js";
import { openApiDocument } from "./docs/openapi.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Required when behind Render/Vercel/Nginx so rate-limit and IP logging work.
  if (env.isProduction) {
    app.set("trust proxy", 1);
  }

  app.disable("x-powered-by");

  app.use(
    helmet({
      // Disable CSP in development so Swagger UI can load; keep defaults in production.
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin: env.corsOrigins,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 600,
    }),
  );

  app.use(compression());
  app.use(hpp());
  app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.isProduction ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
    },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.isProduction ? 20 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many authentication attempts. Please try again later.",
      },
    },
  });

  app.use("/api", globalLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  if (!env.isProduction) {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  }

  app.use("/api", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/lessons", lessonRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
