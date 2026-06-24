/**
 * authService — UI talks to this, not to Supabase directly.
 * Swap implementations later (Express/Prisma) without touching components.
 */
import { supabase } from "@/integrations/supabase/client";

export const authService = {
  async signUp(
    email: string,
    password: string,
    meta?: { username?: string; display_name?: string },
  ) {
    return supabase.auth.signUp({
      email,
      password,
      options: {
        data: meta,
      },
    });
  },
  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },
  async signOut() {
    return supabase.auth.signOut();
  },
  async getSession() {
    return supabase.auth.getSession();
  },
};
