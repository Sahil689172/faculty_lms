import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());

  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        uptime: `${uptimeSeconds}s`,
        environment: env.nodeEnv,
        database: "connected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      data: {
        status: "degraded",
        uptime: `${uptimeSeconds}s`,
        environment: env.nodeEnv,
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Database is unreachable",
      },
    });
  }
});
