import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type ChatThread = {
  id: string;
  user_id: string;
  character_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

const ThreadInput = z.object({
  userId: z.string().min(1),
  characterId: z.string().min(1).nullable(),
  title: z.string().min(1).default("New Chat"),
});

const AddMessageInput = z.object({
  userId: z.string().min(1),
  threadId: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

const ThreadIdInput = z.object({
  threadId: z.string().min(1),
});

const UserIdInput = z.object({
  userId: z.string().min(1),
});

const listThreadsFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => UserIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const rows = await mysqlRepositories.chat.listThreads(data.userId);
    return rows.map((row) => ({
      id: row.id,
      user_id: row.userId,
      character_id: row.characterId,
      title: row.title,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    })) as ChatThread[];
  });

const createThreadFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ThreadInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.chat.createThread(
      data.userId,
      data.characterId,
      data.title,
    );
    return {
      id: row.id,
      user_id: row.userId,
      character_id: row.characterId,
      title: row.title,
      created_at: row.createdAt.toISOString(),
      updated_at: row.updatedAt.toISOString(),
    } satisfies ChatThread;
  });

const listMessagesFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ThreadIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const rows = await mysqlRepositories.chat.listMessages(data.threadId);
    return rows.map((row) => ({
      id: row.id,
      thread_id: row.threadId,
      user_id: row.userId,
      role: row.role,
      content: row.content,
      created_at: row.createdAt.toISOString(),
    })) as ChatMessage[];
  });

const addMessageFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => AddMessageInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    const row = await mysqlRepositories.chat.addMessage(
      data.userId,
      data.threadId,
      data.role,
      data.content,
    );
    return {
      id: row.id,
      thread_id: row.threadId,
      user_id: row.userId,
      role: row.role,
      content: row.content,
      created_at: row.createdAt.toISOString(),
    } satisfies ChatMessage;
  });

const deleteThreadFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => ThreadIdInput.parse(data))
  .handler(async ({ data }) => {
    const { mysqlRepositories } = await import("@/server/mysql/repositories");
    await mysqlRepositories.chat.deleteThread(data.threadId);
    return { ok: true };
  });

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
    return listThreadsFn({ data: { userId } });
  },
  async createThread(userId: string, characterId: string | null, title = "New Chat") {
    return createThreadFn({ data: { userId, characterId, title } });
  },
  async listMessages(threadId: string) {
    return listMessagesFn({ data: { threadId } });
  },
  async addMessage(userId: string, threadId: string, role: ChatMessage["role"], content: string) {
    return addMessageFn({ data: { userId, threadId, role, content } });
  },
  async deleteThread(threadId: string) {
    await deleteThreadFn({ data: { threadId } });
  },
};
