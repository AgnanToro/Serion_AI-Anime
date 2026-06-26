import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ---------- Supabase (lama) — dikomentari, jangan dihapus ----------
// import { supabase } from "@/integrations/supabase/client";
//
// async list_supabase(userId: string) {
//   const { data, error } = await supabase
//     .from("generated_images")
//     .select("*")
//     .eq("user_id", userId)
//     .order("created_at", { ascending: false });
//   if (error) throw error;
//   return (data ?? []) as GeneratedImage[];
// },
// async create_supabase(userId: string, prompt: string, imageUrl: string, style?: string) {
//   const { data, error } = await supabase
//     .from("generated_images")
//     .insert({ user_id: userId, prompt, style, image_url: imageUrl })
//     .select()
//     .single();
//   if (error) throw error;
//   return data as GeneratedImage;
// },
// async toggleFavorite_supabase(id: string, isFav: boolean) {
//   await supabase.from("generated_images").update({ is_favorite: !isFav }).eq("id", id);
// },
// async remove_supabase(id: string) {
//   await supabase.from("generated_images").delete().eq("id", id);
// },
// ------------------------------------------------------------------

export type GeneratedImage = {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string | null;
  style: string | null;
  is_favorite: boolean;
  created_at: string;
};

const UserIdInput = z.object({ userId: z.string().min(1) });

const CreateInput = z.object({
  userId: z.string().min(1),
  prompt: z.string().min(1),
  imageUrl: z.string().min(1),
  style: z.string().optional(),
});

const ToggleFavInput = z.object({
  id: z.string().min(1),
  isFavorite: z.boolean(),
});

const IdInput = z.object({ id: z.string().min(1) });

// ── server functions ─────────────────────────────────────────────────────────

const listFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UserIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const rows = await mysqlRepositories.image.list(data.userId);
    return rows.map((row) => ({
      id: row.id,
      user_id: row.userId,
      prompt: row.prompt,
      image_url: row.imageUrl,
      style: row.style,
      is_favorite: row.isFavorite,
      created_at: row.createdAt.toISOString(),
    })) as GeneratedImage[];
  });

const createFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => CreateInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.image.create(
      data.userId,
      data.prompt,
      data.imageUrl,
      data.style,
    );
    return {
      id: row.id,
      user_id: row.userId,
      prompt: row.prompt,
      image_url: row.imageUrl,
      style: row.style,
      is_favorite: row.isFavorite,
      created_at: row.createdAt.toISOString(),
    } satisfies GeneratedImage;
  });

const toggleFavFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ToggleFavInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    await mysqlRepositories.image.toggleFavorite(data.id, data.isFavorite);
    return { ok: true };
  });

const removeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => IdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    await mysqlRepositories.image.remove(data.id);
    return { ok: true };
  });

// ── public service (shape sama, frontend tidak perlu berubah) ────────────────

export const imageService = {
  async list(userId: string) {
    return listFn({ data: { userId } });
  },
  async create(userId: string, prompt: string, imageUrl: string, style?: string) {
    return createFn({ data: { userId, prompt, imageUrl, style } });
  },
  /** isFav = nilai SAAT INI (service akan flip ke !isFav agar cocok dengan pola lama) */
  async toggleFavorite(id: string, isFav: boolean) {
    return toggleFavFn({ data: { id, isFavorite: !isFav } });
  },
  async remove(id: string) {
    await removeFn({ data: { id } });
  },
};
