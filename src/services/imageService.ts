import { supabase } from "@/integrations/supabase/client";

export type GeneratedImage = {
  id: string;
  user_id: string;
  prompt: string;
  image_url: string | null;
  style: string | null;
  is_favorite: boolean;
  created_at: string;
};

export const imageService = {
  async list(userId: string) {
    const { data, error } = await supabase
      .from("generated_images")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as GeneratedImage[];
  },
  async create(userId: string, prompt: string, imageUrl: string, style?: string) {
    const { data, error } = await supabase
      .from("generated_images")
      .insert({ user_id: userId, prompt, style, image_url: imageUrl })
      .select()
      .single();
    if (error) throw error;
    return data as GeneratedImage;
  },
  async toggleFavorite(id: string, isFav: boolean) {
    await supabase.from("generated_images").update({ is_favorite: !isFav }).eq("id", id);
  },
  async remove(id: string) {
    await supabase.from("generated_images").delete().eq("id", id);
  },
};
