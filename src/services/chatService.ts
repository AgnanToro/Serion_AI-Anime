import { supabase } from "@/integrations/supabase/client";

export type ChatThread = {
  id: string;
  user_id: string;
  character_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  thread_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

export const chatService = {
  async listThreads(userId: string) {
    const { data, error } = await supabase
      .from("chat_threads")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as ChatThread[];
  },
  async createThread(userId: string, characterId: string | null, title = "New Chat") {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId, character_id: characterId, title })
      .select()
      .single();
    if (error) throw error;
    return data as ChatThread;
  },
  async listMessages(threadId: string) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ChatMessage[];
  },
  async addMessage(userId: string, threadId: string, role: ChatMessage["role"], content: string) {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ user_id: userId, thread_id: threadId, role, content })
      .select()
      .single();
    if (error) throw error;
    await supabase
      .from("chat_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", threadId);
    return data as ChatMessage;
  },
  async deleteThread(threadId: string) {
    await supabase.from("chat_threads").delete().eq("id", threadId);
  },
};
