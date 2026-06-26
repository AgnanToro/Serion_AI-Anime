import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@/server/mysql/prisma";

export const Route = createFileRoute("/api/mysql/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          await prisma.$queryRaw`SELECT 1`;
          return Response.json({ ok: true, provider: "mysql", connected: true });
        } catch (error) {
          console.error("MySQL health check failed", error);
          return Response.json(
            {
              ok: false,
              provider: "mysql",
              connected: false,
              error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});