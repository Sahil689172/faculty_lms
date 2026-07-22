import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(
    `Faculty LMS API listening on port ${env.port} (${env.nodeEnv})`,
  );
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.error("Forced shutdown after timeout");
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
    console.error("Error during shutdown:", (failed as PromiseRejectedResult).reason);
  } else {
    console.log("HTTP server closed and Prisma disconnected");
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
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  void shutdown("uncaughtException");
});
