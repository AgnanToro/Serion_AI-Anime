import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { chatService, type ChatThread, type ChatMessage } from "@/services/chatService";
import { CHARACTERS, getCharacter, type Character } from "@/lib/characters";
import { chatReply } from "@/lib/ai.functions";
import { toast } from "sonner";

type ChatSearch = { c?: string; thread?: string };

export const Route = createFileRoute("/_authenticated/chat")({
  validateSearch: (s: Record<string, unknown>): ChatSearch => ({
    c: typeof s.c === "string" ? s.c : undefined,
    thread: typeof s.thread === "string" ? s.thread : undefined,
  }),
  component: ChatPage,
});

/** Map a thread → characterId locally (DB doesn't store static character slugs). */
const charKey = (userId: string) => `serion:thread-chars:${userId}`;
function readThreadChars(userId: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(charKey(userId)) ?? "{}");
  } catch {
    return {};
  }
}
function writeThreadChars(userId: string, map: Record<string, string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(charKey(userId), JSON.stringify(map));
}

function ChatPage() {
  const { user } = useAuth();
  const search = useSearch({ from: "/_authenticated/chat" });
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [active, setActive] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [threadChars, setThreadChars] = useState<Record<string, string>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    setThreadChars(readThreadChars(user.id));
    chatService.listThreads(user.id).then((t) => {
      setThreads(t);
      if (search.thread) {
        const found = t.find((x) => x.id === search.thread);
        if (found) setActive(found);
      } else if (t[0]) setActive(t[0]);
    });
  }, [user, search.thread]);

  // If ?c=<slug> is in the URL and we don't already have a chat for it, create one
  useEffect(() => {
    if (!user || !search.c) return;
    const slug = search.c;
    const existingId = Object.entries(threadChars).find(([, v]) => v === slug)?.[0];
    if (existingId) {
      const t = threads.find((x) => x.id === existingId);
      if (t) {
        setActive(t);
        return;
      }
    }
    const ch = getCharacter(slug);
    if (!ch) return;
    (async () => {
      const t = await chatService.createThread(user.id, null, `Chat with ${ch.name}`);
      const next = { ...threadChars, [t.id]: slug };
      setThreadChars(next);
      writeThreadChars(user.id, next);
      setThreads((p) => [t, ...p]);
      setActive(t);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, search.c]);

  useEffect(() => {
    if (active) chatService.listMessages(active.id).then(setMessages);
    else setMessages([]);
  }, [active]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9 });
  }, [messages]);

  async function newThread(slug: string | null = null) {
    if (!user) return;
    const ch = slug ? getCharacter(slug) : null;
    const t = await chatService.createThread(
      user.id,
      null,
      ch ? `Chat with ${ch.name}` : "New Chat",
    );
    if (slug) {
      const next = { ...threadChars, [t.id]: slug };
      setThreadChars(next);
      writeThreadChars(user.id, next);
    }
    setThreads((p) => [t, ...p]);
    setActive(t);
  }

  async function send() {
    if (!user || !active || !input.trim()) return;
    const text = input;
    setInput("");
    const m = await chatService.addMessage(user.id, active.id, "user", text);
    setMessages((p) => [...p, m]);
    setThinking(true);
    try {
      const history = [...messages, m]
        .filter((x) => x.role === "user" || x.role === "assistant")
        .map((x) => ({ role: x.role as "user" | "assistant", content: x.content }));
      const ch = active ? getCharacter(threadChars[active.id]) : undefined;
      const { content } = await chatReply({
        data: {
          character: ch
            ? { name: ch.name, anime: ch.anime, description: ch.description, tags: ch.tags }
            : null,
          history,
        },
      });
      const reply = await chatService.addMessage(
        user.id,
        active.id,
        "assistant",
        content || "(kosong)",
      );
      setMessages((p) => [...p, reply]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membalas");
    } finally {
      setThinking(false);
    }
  }

  const activeChar: Character | undefined = active
    ? getCharacter(threadChars[active.id])
    : undefined;

  return (
    <div className="h-[calc(100vh-8rem)] grid lg:grid-cols-[260px_1fr_320px] gap-4">
      {/* Threads sidebar */}
      <aside className="rounded-3xl glass p-3 flex flex-col">
        <Button
          onClick={() => newThread(null)}
          className="rounded-full bg-brand text-background border-0 hover:bg-brand/90 mb-3"
        >
          <Plus className="h-4 w-4 mr-1" /> New chat
        </Button>
        <div className="px-2 mb-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
            Start with
          </p>
          <div className="grid grid-cols-4 gap-1.5 mt-1.5">
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => newThread(c.id)}
                title={`Chat with ${c.name}`}
                className="aspect-square rounded-full overflow-hidden ring-1 ring-border hover:ring-brand transition"
              >
                <img src={c.avatar_url} alt={c.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t)}
                className={`group w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between ${
                  active?.id === t.id
                    ? "bg-accent text-foreground"
                    : "hover:bg-accent/60 text-muted-foreground"
                }`}
              >
                <span className="truncate">{t.title}</span>
                <Trash2
                  className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await chatService.deleteThread(t.id);
                    setThreads((p) => p.filter((x) => x.id !== t.id));
                    if (active?.id === t.id) setActive(null);
                  }}
                />
              </button>
            ))}
            {threads.length === 0 && (
              <p className="text-xs text-muted-foreground px-3 py-2">No chats yet — start one.</p>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Conversation */}
      <section className="rounded-3xl glass flex flex-col overflow-hidden">
        <header className="px-5 py-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeChar && (
              <img
                src={activeChar.avatar_url}
                alt={activeChar.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <div>
              <p className="text-sm font-medium">{active?.title ?? "Pick or start a chat"}</p>
              {activeChar && <p className="text-xs text-muted-foreground">{activeChar.anime}</p>}
            </div>
          </div>
        </header>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && active && (
            <p className="text-center text-sm text-muted-foreground mt-20">
              Say hi to {activeChar?.name ?? "your companion"} to start the conversation.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  m.role === "user" ? "bg-brand text-background" : "glass"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="glass px-4 py-2.5 rounded-2xl text-sm inline-flex items-center gap-1.5">
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-foreground/60"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-border/60">
          <div className="flex items-center gap-2 glass rounded-2xl p-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={
                active
                  ? `Message ${activeChar?.name ?? "your companion"}…`
                  : "Start a new chat first"
              }
              disabled={!active}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              onClick={send}
              disabled={!active || !input.trim()}
              className="rounded-full bg-brand text-background border-0 hover:bg-brand/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Character stage */}
      <aside className="hidden lg:flex rounded-3xl glass overflow-hidden flex-col items-center justify-end relative">
        {activeChar ? (
          <>
            <div className="absolute inset-0 aurora opacity-50 pointer-events-none" />
            <motion.img
              key={activeChar.id}
              src={activeChar.avatar_url}
              alt={activeChar.name}
              className="relative w-full h-full object-cover"
              animate={
                thinking
                  ? { scale: [1, 1.015, 1, 1.02, 1], y: [0, -2, 0, -3, 0] }
                  : { scale: [1, 1.005, 1], y: [0, -1, 0] }
              }
              transition={{ duration: thinking ? 0.45 : 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
              <p className="font-semibold">{activeChar.name}</p>
              <p className="text-xs opacity-80">{activeChar.anime}</p>
              {thinking && (
                <motion.p
                  className="text-[10px] mt-1 opacity-90 inline-flex items-center gap-1"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  ● speaking…
                </motion.p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 grid place-items-center p-6 text-center text-sm text-muted-foreground">
            Pick a companion to bring this stage to life.
          </div>
        )}
      </aside>
    </div>
  );
}
