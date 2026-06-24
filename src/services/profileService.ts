import { supabase } from "@/integrations/supabase/client";

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

export const profileService = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },
  async update(userId: string, patch: Partial<Profile>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },
  async uploadAvatar(userId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) throw upErr;
    const { data } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (!data?.signedUrl) throw new Error("Could not create signed URL");
    return data.signedUrl;
  },
  async getSettings(userId: string) {
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data as UserSettings | null;
  },
  async updateSettings(userId: string, patch: Partial<UserSettings>) {
    const { data, error } = await supabase
      .from("user_settings")
      .upsert({ user_id: userId, ...patch })
      .select()
      .single();
    if (error) throw error;
    return data as UserSettings;
  },
};
