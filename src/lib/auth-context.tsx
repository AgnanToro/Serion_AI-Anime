import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@/services/authService";
import { authService } from "@/services/authService";
import { getToken, clearToken } from "@/integrations/auth/token-storage";

// ---------- Supabase (lama) — dikomentari, jangan dihapus ----------
// import type { User, Session } from "@supabase/supabase-js";
// import { supabase } from "@/integrations/supabase/client";
// ------------------------------------------------------------------

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  /** Panggil ini setelah signIn/signUp berhasil agar context langsung ter-update. */
  setUser: (u: AuthUser | null) => void;
  /** Panggil ini untuk logout. */
  onSignOut: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  setUser: () => {},
  onSignOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage token
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getMe(token)
      .then((u) => setUser(u))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const onSignOut = () => {
    authService.signOut();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, setUser, onSignOut }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
