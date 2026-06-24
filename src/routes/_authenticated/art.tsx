import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wand2, Heart, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { imageService, type GeneratedImage } from "@/services/imageService";
import { streamImage } from "@/lib/streamImage";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/art")({
  component: ArtPage,
});

function ArtPage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<GeneratedImage[]>([]);
  const [preview, setPreview] = useState<{ url: string; isFinal: boolean } | null>(null);

  useEffect(() => {
    if (user) imageService.list(user.id).then(setItems);
  }, [user]);

  async function generate() {
    if (!user || !prompt.trim()) return;
    setBusy(true);
    setPreview(null);
    const promptText = prompt;
    try {
      let finalUrl: string | null = null;
      await streamImage("/api/generate-image", promptText, (dataUrl, isFinal) => {
        setPreview({ url: dataUrl, isFinal });
        if (isFinal) finalUrl = dataUrl;
      });
      if (!finalUrl) throw new Error("Tidak ada gambar dihasilkan");
      const img = await imageService.create(user.id, promptText, finalUrl);
      setItems((p) => [img, ...p]);
      setPrompt("");
      setPreview(null);
      toast.success("Gambar berhasil dibuat ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat gambar");
      setPreview(null);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    await imageService.remove(id);
    setItems((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Anime <span className="gradient-brand-text">Art</span>
        </h1>
        <p className="text-muted-foreground mt-1">Describe a scene, character, or mood.</p>
      </div>
      <div className="glass rounded-3xl p-4 space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A magical sunset over a futuristic Tokyo skyline, anime key visual, cinematic lighting…"
          className="min-h-28 bg-transparent resize-none border-0 focus-visible:ring-0"
        />
        <div className="flex justify-end">
          <Button
            onClick={generate}
            disabled={busy || !prompt.trim()}
            className="rounded-full gradient-brand text-background border-0"
          >
            <Wand2 className="h-4 w-4 mr-1" /> {busy ? "Generating…" : "Generate"}
          </Button>
        </div>
      </div>
      {preview && (
        <div className="glass rounded-3xl overflow-hidden">
          <div className="aspect-square bg-accent overflow-hidden">
            <img
              src={preview.url}
              alt="Preview"
              className={`h-full w-full object-cover transition-[filter] duration-500 ${preview.isFinal ? "blur-0" : "blur-2xl"}`}
            />
          </div>
        </div>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it) => (
          <div key={it.id} className="glass rounded-3xl overflow-hidden group">
            <div className="aspect-square bg-accent grid place-items-center overflow-hidden">
              {it.image_url ? (
                <img src={it.image_url} alt={it.prompt} className="h-full w-full object-cover" />
              ) : (
                <span className="text-muted-foreground">No preview</span>
              )}
            </div>
            <div className="p-3 space-y-2">
              <p className="text-xs text-muted-foreground line-clamp-2">{it.prompt}</p>
              <div className="flex justify-end gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={async () => {
                    await imageService.toggleFavorite(it.id, it.is_favorite);
                    setItems((p) =>
                      p.map((x) => (x.id === it.id ? { ...x, is_favorite: !x.is_favorite } : x)),
                    );
                  }}
                >
                  <Heart
                    className={`h-4 w-4 ${it.is_favorite ? "fill-current text-pink-500" : ""}`}
                  />
                </Button>
                <Button size="icon" variant="ghost" className="rounded-full" asChild>
                  <a href={it.image_url ?? "#"} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => remove(it.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No images yet — generate your first one above.
          </p>
        )}
      </div>
    </div>
  );
}
