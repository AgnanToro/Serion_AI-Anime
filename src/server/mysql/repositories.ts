import { prisma } from "./prisma";

export const mysqlRepositories = {
  profile: {
    get(userId: string) {
      return prisma.profile.findUnique({ where: { id: userId } });
    },
    update(userId: string, patch: Record<string, unknown>) {
      return prisma.profile.upsert({
        where: { id: userId },
        create: { id: userId, ...patch },
        update: patch,
      });
    },
    getSettings(userId: string) {
      return prisma.userSettings.findUnique({ where: { userId } });
    },
    updateSettings(userId: string, patch: Record<string, unknown>) {
      return prisma.userSettings.upsert({
        where: { userId },
        create: { userId, ...patch },
        update: patch,
      });
    },
  },
  chat: {
    listThreads(userId: string) {
      return prisma.chatThread.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
    },
    createThread(userId: string, characterId: string | null, title = "New Chat") {
      return prisma.chatThread.create({
        data: { userId, characterId, title },
      });
    },
    listMessages(threadId: string) {
      return prisma.chatMessage.findMany({
        where: { threadId },
        orderBy: { createdAt: "asc" },
      });
    },
    addMessage(userId: string, threadId: string, role: "user" | "assistant" | "system", content: string) {
      return prisma.$transaction(async (tx) => {
        const message = await tx.chatMessage.create({
          data: { userId, threadId, role, content },
        });
        await tx.chatThread.update({
          where: { id: threadId },
          data: { updatedAt: new Date() },
        });
        return message;
      });
    },
    deleteThread(threadId: string) {
      return prisma.chatThread.delete({ where: { id: threadId } });
    },
  },
  voice: {
    list(userId: string) {
      return prisma.generatedVoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
    create(userId: string, text: string, audioUrl: string, voiceStyle?: string) {
      return prisma.generatedVoice.create({
        data: {
          userId,
          text,
          audioUrl,
          voiceStyle,
          durationMs: Math.min(text.length * 60, 30000),
        },
      });
    },
    remove(id: string) {
      return prisma.generatedVoice.delete({ where: { id } });
    },
  },
  image: {
    list(userId: string) {
      return prisma.generatedImage.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
    },
    create(userId: string, prompt: string, imageUrl: string, style?: string) {
      return prisma.generatedImage.create({
        data: { userId, prompt, imageUrl, style },
      });
    },
    toggleFavorite(id: string, isFavorite: boolean) {
      return prisma.generatedImage.update({
        where: { id },
        data: { isFavorite },
      });
    },
    remove(id: string) {
      return prisma.generatedImage.delete({ where: { id } });
    },
  },
  characters: {
    list() {
      return prisma.character.findMany({ where: { isActive: true } });
    },
    listFavorites(userId: string) {
      return prisma.favorite.findMany({
        where: { userId },
        select: { characterId: true },
      });
    },
    addFavorite(userId: string, characterId: string) {
      return prisma.favorite.create({ data: { userId, characterId } });
    },
    removeFavorite(userId: string, characterId: string) {
      return prisma.favorite.deleteMany({ where: { userId, characterId } });
    },
  },
};