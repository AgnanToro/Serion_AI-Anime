/**
 * authService — UI talks to this, not to any auth backend directly.
 * Backed by custom JWT + MySQL (via server functions).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { saveToken, clearToken } from "@/integrations/auth/token-storage";

// ---------- Supabase (lama) — dikomentari, jangan dihapus ----------
// import { supabase } from "@/integrations/supabase/client";
//
// async signUp(email, password, meta?) {
//   return supabase.auth.signUp({ email, password, options: { data: meta } });
// },
// async signIn(email, password) {
//   return supabase.auth.signInWithPassword({ email, password });
// },
// async signOut() { return supabase.auth.signOut(); },
// async getSession() { return supabase.auth.getSession(); },
// ------------------------------------------------------------------

export type AuthUser = {
  id: string;
  email: string;
};

const SignUpInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().optional(),
  display_name: z.string().optional(),
});

const SignInInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const GetUserInput = z.object({
  token: z.string().min(1),
});

// ── server functions ─────────────────────────────────────────────────────────

const signUpFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => SignUpInput.parse(data))
  .handler(async ({ data }) => {
    const { registerUser } = await import("@/server/auth");
    return registerUser(data.email, data.password, {
      username: data.username,
      display_name: data.display_name,
    });
  });

const signInFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => SignInInput.parse(data))
  .handler(async ({ data }) => {
    const { loginUser } = await import("@/server/auth");
    return loginUser(data.email, data.password);
  });

const getMeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => GetUserInput.parse(data))
  .handler(async ({ data }) => {
    const { getUserFromToken } = await import("@/server/auth");
    return getUserFromToken(data.token);
  });

// ── public service ────────────────────────────────────────────────────────────

export const authService = {
  async signUp(
    email: string,
    password: string,
    meta?: { username?: string; display_name?: string },
  ): Promise<{ user?: AuthUser; error?: { message: string } }> {
    const result = await signUpFn({
      data: { email, password, username: meta?.username, display_name: meta?.display_name },
    });
    if (result.error) return { error: { message: result.error } };
    saveToken(result.token!);
    return { user: result.user };
  },

  async signIn(
    email: string,
    password: string,
  ): Promise<{ user?: AuthUser; error?: { message: string } }> {
    const result = await signInFn({ data: { email, password } });
    if (result.error) return { error: { message: result.error } };
    saveToken(result.token!);
    return { user: result.user };
  },

  async signOut(): Promise<void> {
    clearToken();
  },

  /** Ambil user dari token yang tersimpan di localStorage. */
  async getMe(token: string): Promise<AuthUser | null> {
    return getMeFn({ data: { token } });
  },
};
