import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./lib/logger.js";

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`Faculty LMS API listening on port ${env.port}`, {
    environment: env.nodeEnv,
    storageConfigured: env.isStorageConfigured,
  });
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 5_000);
  forceExit.unref();

  const httpClosed = new Promise<void>((resolve) => {
    server.close(() => resolve());
    // Drop keep-alive sockets so the pooler connections are released immediately
    // (important for tsx watch restarts, which otherwise leak connections).
    server.closeAllConnections?.();
  });

  const results = await Promise.allSettled([httpClosed, prisma.$disconnect()]);
  const failed = results.find((result) => result.status === "rejected");

  if (failed) {
    logger.error("Error during shutdown", (failed as PromiseRejectedResult).reason);
  } else {
    logger.info("HTTP server closed and Prisma disconnected");
  }

  clearTimeout(forceExit);
  process.exit(failed ? 1 : 0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", reason);
  if (env.isProduction) {
    void shutdown("unhandledRejection");
  }
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
  void shutdown("uncaughtException");
});
