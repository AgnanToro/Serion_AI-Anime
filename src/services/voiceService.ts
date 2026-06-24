import { supabase } from "@/integrations/supabase/client";

export type GeneratedVoice = {
  id: string;
  user_id: string;
  text: string;
  audio_url: string | null;
  voice_style: string | null;
  duration_ms: number | null;
  created_at: string;
};

export const voiceService = {
  async list(userId: string) {
    const { data, error } = await supabase
      .from("generated_voices")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as GeneratedVoice[];
  },
  async create(userId: string, text: string, audioUrl: string, voice_style?: string) {
    const { data, error } = await supabase
      .from("generated_voices")
      .insert({
        user_id: userId,
        text,
        voice_style,
        audio_url: audioUrl,
        duration_ms: Math.min(text.length * 60, 30000),
      })
      .select()
      .single();
    if (error) throw error;
    return data as GeneratedVoice;
  },
  async remove(id: string) {
    await supabase.from("generated_voices").delete().eq("id", id);
  },
};
