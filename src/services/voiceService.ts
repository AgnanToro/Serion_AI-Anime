import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type GeneratedVoice = {
  id: string;
  user_id: string;
  text: string;
  audio_url: string | null;
  voice_style: string | null;
  duration_ms: number | null;
  created_at: string;
};

const UserIdInput = z.object({
  userId: z.string().min(1),
});

const CreateVoiceInput = z.object({
  userId: z.string().min(1),
  text: z.string().min(1),
  audioUrl: z.string().min(1),
  voiceStyle: z.string().optional(),
});

const IdInput = z.object({
  id: z.string().min(1),
});

const listFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UserIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const rows = await mysqlRepositories.voice.list(data.userId);
    return rows.map((row) => ({
      id: row.id,
      user_id: row.userId,
      text: row.text,
      audio_url: row.audioUrl,
      voice_style: row.voiceStyle,
      duration_ms: row.durationMs,
      created_at: row.createdAt.toISOString(),
    })) as GeneratedVoice[];
  });

const createFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => CreateVoiceInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.voice.create(
      data.userId,
      data.text,
      data.audioUrl,
      data.voiceStyle,
    );
    return {
      id: row.id,
      user_id: row.userId,
      text: row.text,
      audio_url: row.audioUrl,
      voice_style: row.voiceStyle,
      duration_ms: row.durationMs,
      created_at: row.createdAt.toISOString(),
    } satisfies GeneratedVoice;
  });

const removeFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => IdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    await mysqlRepositories.voice.remove(data.id);
    return { ok: true };
  });

export const voiceService = {
  async list(userId: string) {
    return listFn({ data: { userId } });
  },
  async create(userId: string, text: string, audioUrl: string, voice_style?: string) {
    return createFn({ data: { userId, text, audioUrl, voiceStyle: voice_style } });
  },
  async remove(id: string) {
    await removeFn({ data: { id } });
  },
};
