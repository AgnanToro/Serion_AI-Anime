/**
 * characterService — currently backed by a static catalog (src/lib/characters.ts)
 * so the frontend stays decoupled from the backend. When migrating to a real
 * REST API later, only this file needs to change.
 */
import { CHARACTERS, type Character } from "@/lib/characters";

export type { Character } from "@/lib/characters";

const FAV_KEY = (userId: string) => `serion:favorites:${userId}`;

function readFavs(userId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(FAV_KEY(userId));
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeFavs(userId: string, set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAV_KEY(userId), JSON.stringify([...set]));
}

export const characterService = {
  async list(): Promise<Character[]> {
    return CHARACTERS;
  },
  async favorites(userId: string): Promise<Set<string>> {
    return readFavs(userId);
  },
  async toggleFavorite(userId: string, characterId: string, isFav: boolean) {
    const next = readFavs(userId);
    if (isFav) next.delete(characterId);
    else next.add(characterId);
    writeFavs(userId, next);
  },
};
