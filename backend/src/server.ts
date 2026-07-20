import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(
    `Faculty LMS API listening on port ${env.port} (${env.nodeEnv})`,
  );
});

async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(async (closeError) => {
    if (closeError) {
      console.error("Error closing HTTP server:", closeError);
    }

    try {
      await prisma.$disconnect();
      console.log("Prisma disconnected");
      process.exit(closeError ? 1 : 0);
    } catch (disconnectError) {
      console.error("Error disconnecting Prisma:", disconnectError);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
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
