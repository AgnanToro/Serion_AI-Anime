import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, MessagesSquare, Mic, ArrowUpRight, Sparkles, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
// import { CHARACTERS } from "@/lib/characters"; // pindah ke MySQL via characterService
import { characterService, type Character } from "@/services/characterService";
import { chatService, type ChatThread } from "@/services/chatService";
import { profileService } from "@/services/profileService";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [displayName, setDisplayName] = useState<string>("");
  const [recent, setRecent] = useState<ChatThread[]>([]);

  useEffect(() => {
    characterService.list().then(setCharacters);
  }, []);

  useEffect(() => {
    if (!user) return;
    chatService.listThreads(user.id).then((t) => setRecent(t.slice(0, 4)));
    profileService.get(user.id).then((p) => {
      setDisplayName(p?.display_name ?? p?.username ?? user.email.split("@")[0]);
    });
  }, [user]);

  const tiles = [
    {
      to: "/chat",
      title: "Anime Chat",
      desc: "Start a new conversation with a companion.",
      icon: MessagesSquare,
    },
    { to: "/art", title: "Anime Art", desc: "Generate cinematic anime artwork.", icon: ImageIcon },
    { to: "/voice", title: "Anime Voice", desc: "Render expressive anime voice clips.", icon: Mic },
  ] as const;

  return (
    <div className="space-y-10 max-w-6xl">
      {/* HERO PANEL */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl glass p-8 lg:p-10"
      >
        <div className="absolute inset-0 aurora opacity-60 pointer-events-none" />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs mb-3">
              <Sparkles className="h-3 w-3" /> Welcome back
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Hello, <span className="text-brand">{displayName}</span> ✨
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Pick a companion and dive into a story, render anime artwork, or generate a voice line
              — all from one place.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <Link
                to="/chat"
                className="rounded-full bg-brand text-background px-5 py-2.5 text-sm hover:bg-brand/90 transition"
              >
                Start a chat
              </Link>
              <Link
                to="/art"
                className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-accent transition"
              >
                Generate art
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex -space-x-3">
            {characters.map((c) => (
              <img
                key={c.id}
                src={c.avatar_url ?? "/placeholder-avatar.svg"}
                alt={c.name}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-background"
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* TILES */}
      <section className="grid sm:grid-cols-3 gap-4">
        {tiles.map((t, i) => (
          <motion.div
            key={t.to}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Link
              to={t.to}
              className="group block p-6 rounded-3xl glass hover:border-brand/40 transition relative overflow-hidden"
            >
              <t.icon className="h-7 w-7 text-brand mb-4" />
              <h3 className="font-semibold">{t.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
            </Link>
          </motion.div>
        ))}
      </section>

      {/* COMPANIONS */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-semibold">Your companions</h2>
          <Link to="/characters" className="text-xs text-brand hover:underline">
            See all
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {characters.map((c) => (
            <Link
              key={c.id}
              to="/chat"
              search={{ c: c.id } as never}
              className="group rounded-3xl overflow-hidden glass hover:-translate-y-1 transition relative"
            >
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={c.avatar_url ?? "/placeholder-avatar.svg"}
                  alt={c.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-[10px] opacity-80">{c.anime}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RECENT */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Recent chats</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No conversations yet — start one from a companion above.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {recent.map((t) => (
              <Link
                key={t.id}
                to="/chat"
                search={{ thread: t.id } as never}
                className="p-4 rounded-2xl glass hover:border-brand/40 transition flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.updated_at).toLocaleString()}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
