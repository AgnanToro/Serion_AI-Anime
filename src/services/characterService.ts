/**
 * characterService — karakter sekarang dari MySQL (seeded dari Supabase data).
 * Favorites juga ke MySQL.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ---------- Static catalog (lama) — dikomentari, jangan dihapus ----------
// import { CHARACTERS, type Character } from "@/lib/characters";
// export type { Character } from "@/lib/characters";
// async list() { return CHARACTERS; }
// -------------------------------------------------------------------------

// ---------- Supabase localStorage favorites (lama) — dikomentari ----------
// const FAV_KEY = (userId: string) => `serion:favorites:${userId}`;
// function readFavs(userId) { ... localStorage ... }
// function writeFavs(userId, set) { ... localStorage ... }
// --------------------------------------------------------------------------

export type Character = {
  id: string;
  name: string;
  anime: string;
  description: string | null;
  tags: string[];
  avatar_url: string | null;
  accent_color: string | null;
};

const FavInput = z.object({
  userId: z.string().min(1),
  characterId: z.string().min(1),
});

const UserIdInput = z.object({ userId: z.string().min(1) });

// ── server functions ─────────────────────────────────────────────────────────

const listCharactersFn = createServerFn({ method: "POST" })
  .handler(async () => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const rows = await mysqlRepositories.characters.list();
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      anime: row.anime,
      description: row.description,
      tags: (row.tags as string[] | null) ?? [],
      avatar_url: row.avatarUrl,
      accent_color: row.accentColor,
    })) as Character[];
  });

const listFavoritesFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UserIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const rows = await mysqlRepositories.characters.listFavorites(data.userId);
    return rows.map((r) => r.characterId) as string[];
  });

const addFavoriteFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => FavInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    await mysqlRepositories.characters.addFavorite(data.userId, data.characterId);
    return { ok: true };
  });

const removeFavoriteFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => FavInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    await mysqlRepositories.characters.removeFavorite(data.userId, data.characterId);
    return { ok: true };
  });

// ── public service ────────────────────────────────────────────────────────────

export const characterService = {
  /** Daftar semua karakter aktif dari MySQL. */
  async list(): Promise<Character[]> {
    return listCharactersFn();
  },

  /** Set<characterId> dari MySQL. */
  async favorites(userId: string): Promise<Set<string>> {
    const ids = await listFavoritesFn({ data: { userId } });
    return new Set(ids);
  },

  /**
   * Toggle favorite.
   * @param isFav — nilai SAAT INI; true = sedang favorit → akan dihapus.
   */
  async toggleFavorite(userId: string, characterId: string, isFav: boolean) {
    if (isFav) {
      await removeFavoriteFn({ data: { userId, characterId } });
    } else {
      await addFavoriteFn({ data: { userId, characterId } });
    }
  },
};

/** Helper — ambil satu karakter berdasarkan id dari list. */
export async function getCharacter(id: string | null | undefined): Promise<Character | undefined> {
  if (!id) return undefined;
  const all = await characterService.list();
  return all.find((c) => c.id === id);
}
