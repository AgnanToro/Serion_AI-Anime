import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ---------- Supabase (lama) — dikomentari, jangan dihapus ----------
// import { supabase } from "@/integrations/supabase/client";
//
// async uploadAvatar_supabase(userId: string, file: File): Promise<string> {
//   const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
//   const path = `${userId}/avatar-${Date.now()}.${ext}`;
//   const { error: upErr } = await supabase.storage
//     .from("avatars")
//     .upload(path, file, { upsert: true, contentType: file.type });
//   if (upErr) throw upErr;
//   const { data } = await supabase.storage
//     .from("avatars")
//     .createSignedUrl(path, 60 * 60 * 24 * 365);
//   if (!data?.signedUrl) throw new Error("Could not create signed URL");
//   return data.signedUrl;
// },
// ------------------------------------------------------------------

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  user_id: string;
  theme: "dark" | "light" | "system";
  preferred_character: string | null;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  updated_at: string;
};

const UserIdInput = z.object({
  userId: z.string().min(1),
});

const ProfileUpdateInput = z.object({
  userId: z.string().min(1),
  patch: z.record(z.unknown()),
});

const SettingsUpdateInput = z.object({
  userId: z.string().min(1),
  patch: z.record(z.unknown()),
});

const UploadAvatarInput = z.object({
  userId: z.string().min(1),
  /** Base64-encoded file content */
  base64: z.string().min(1),
  /** MIME type, e.g. "image/png" */
  mimeType: z.string().min(1),
  ext: z.string().min(1),
});

// ── server functions ─────────────────────────────────────────────────────────

const getProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UserIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.profile.get(data.userId);
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      display_name: row.displayName,
      avatar_url: row.avatarUrl,
      bio: row.bio,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    } satisfies Profile;
  });

const updateProfileFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ProfileUpdateInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.profile.update(data.userId, data.patch);
    return {
      id: row.id,
      username: row.username,
      display_name: row.displayName,
      avatar_url: row.avatarUrl,
      bio: row.bio,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    } satisfies Profile;
  });

const getSettingsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UserIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.profile.getSettings(data.userId);
    if (!row) return null;
    return {
      user_id: row.userId,
      theme: row.theme,
      preferred_character: row.preferredCharacterId,
      language: row.language,
      notifications_enabled: row.notificationsEnabled,
      email_notifications: row.emailNotifications,
      updated_at: row.updatedAt.toISOString(),
    } satisfies UserSettings;
  });

const updateSettingsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => SettingsUpdateInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.profile.updateSettings(data.userId, data.patch);
    return {
      user_id: row.userId,
      theme: row.theme,
      preferred_character: row.preferredCharacterId,
      language: row.language,
      notifications_enabled: row.notificationsEnabled,
      email_notifications: row.emailNotifications,
      updated_at: row.updatedAt.toISOString(),
    } satisfies UserSettings;
  });

/**
 * Upload avatar ke disk server (`public/uploads/avatars/`).
 * File dikirim sebagai base64 agar kompatibel dengan serverFn (tidak support FormData).
 */
const uploadAvatarFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UploadAvatarInput.parse(data))
  .handler(async ({ data }) => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars", data.userId);
    await fs.mkdir(uploadDir, { recursive: true });

    const filename = `avatar-${Date.now()}.${data.ext}`;
    const filePath = path.join(uploadDir, filename);
    const buffer = Buffer.from(data.base64, "base64");
    await fs.writeFile(filePath, buffer);

    // Hapus avatar lama (opsional, jaga disk)
    try {
      const files = await fs.readdir(uploadDir);
      for (const f of files) {
        if (f !== filename && f.startsWith("avatar-")) {
          await fs.unlink(path.join(uploadDir, f)).catch(() => {});
        }
      }
    } catch {}

    // Return public URL (relatif ke root server)
    const publicUrl = `/uploads/avatars/${data.userId}/${filename}`;

    // Update avatar_url di profile
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    await mysqlRepositories.profile.update(data.userId, { avatarUrl: publicUrl });

    return { url: publicUrl };
  });

// ── public service ────────────────────────────────────────────────────────────

export const profileService = {
  async get(userId: string) {
    return getProfileFn({ data: { userId } });
  },
  async update(userId: string, patch: Partial<Profile>) {
    return updateProfileFn({ data: { userId, patch } });
  },

  /**
   * Upload avatar ke disk lokal.
   * File → dibaca sebagai base64 di client → dikirim ke serverFn → disimpan di disk.
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const result = await uploadAvatarFn({
      data: { userId, base64, mimeType: file.type, ext },
    });
    return result.url;
  },

  async getSettings(userId: string) {
    return getSettingsFn({ data: { userId } });
  },
  async updateSettings(userId: string, patch: Partial<UserSettings>) {
    return updateSettingsFn({ data: { userId, patch } });
  },
};
