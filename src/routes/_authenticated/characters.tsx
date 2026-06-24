import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CHARACTERS } from "@/lib/characters";
import { characterService } from "@/services/characterService";
import { useAuth } from "@/lib/auth-context";
import { CharacterCard } from "@/components/serion/CharacterCard";

export const Route = createFileRoute("/_authenticated/characters")({
  component: CharactersPage,
});

function CharactersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) characterService.favorites(user.id).then(setFavs);
  }, [user]);

  async function onFav(id: string) {
    if (!user) return;
    const isFav = favs.has(id);
    const next = new Set(favs);
    if (isFav) next.delete(id);
    else next.add(id);
    setFavs(next);
    await characterService.toggleFavorite(user.id, id, isFav);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Choose Your <span className="text-brand">AI Companion</span>
        </h1>
        <p className="text-muted-foreground mt-1">Pick a character to chat with.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {CHARACTERS.map((c) => (
          <CharacterCard
            key={c.id}
            c={c}
            isFav={favs.has(c.id)}
            onFav={() => onFav(c.id)}
            onChat={() => navigate({ to: "/chat", search: { c: c.id } as never })}
          />
        ))}
      </div>
    </div>
  );
}
