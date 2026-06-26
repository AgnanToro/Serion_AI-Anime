/**
 * Server-side middleware — validasi JWT dari Authorization header.
 * Pengganti `requireSupabaseAuth`.
 */
import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { verifyToken } from "@/server/auth/jwt";

export const requireJwtAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error("Unauthorized: No request headers available");
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized: Bearer token required");
    }

    const token = authHeader.slice(7);
    if (!token) throw new Error("Unauthorized: No token provided");

    let payload;
    try {
      payload = await verifyToken(token);
    } catch {
      throw new Error("Unauthorized: Invalid or expired token");
    }

    return next({
      context: {
        userId: payload.sub,
        email: payload.email,
      },
    });
  },
);
