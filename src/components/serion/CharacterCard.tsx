import { motion } from "framer-motion";
import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
// import type { Character } from "@/lib/characters"; // dipindah ke characterService
import type { Character } from "@/services/characterService";

export function CharacterCard({
  c,
  isFav,
  onFav,
  onChat,
}: {
  c: Character;
  isFav?: boolean;
  onFav?: () => void;
  onChat?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative rounded-3xl overflow-hidden glass"
    >
      <div className="relative">
        <div className="aspect-[3/4] overflow-hidden">
          <img
            src={c.avatar_url ?? "/placeholder-avatar.svg"}
            alt={c.name}
            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>
        <div className="p-5 space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{c.name}</h3>
            <p className="text-xs text-muted-foreground">{c.anime}</p>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">{c.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {c.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 rounded-full bg-brand text-background border-0 hover:bg-brand/90"
              onClick={onChat}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
            </Button>
            {onFav && (
              <Button
                size="icon"
                variant="outline"
                className="rounded-full"
                onClick={onFav}
                aria-label="Favorite"
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-current text-pink-500" : ""}`} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
