/**
 * Client-side middleware — attach JWT dari localStorage ke setiap serverFn RPC.
 * Pengganti `attachSupabaseAuth`.
 */
import { createMiddleware } from "@tanstack/react-start";
import { getToken } from "./token-storage";

export const attachJwtAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const token = getToken();
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
