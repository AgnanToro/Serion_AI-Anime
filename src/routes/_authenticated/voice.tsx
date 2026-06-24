import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Mic, Download, Play, Pause, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { voiceService, type GeneratedVoice } from "@/services/voiceService";
import { generateVoiceFn } from "@/lib/ai.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/voice")({
  component: VoicePage,
});

function VoicePage() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [items, setItems] = useState<GeneratedVoice[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [voice, setVoice] = useState<"Kore" | "Aoede" | "Leda" | "Zephyr">("Kore");

  useEffect(() => {
    if (user) voiceService.list(user.id).then(setItems);
  }, [user]);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioRef.current = null;
    setPlayingId(null);
  }

  async function playDataUrl(id: string, url: string) {
    stopAudio();
    const a = new Audio(url);
    audioRef.current = a;
    setPlayingId(id);
    a.onended = () => setPlayingId(null);
    a.onerror = () => {
      toast.error("Gagal memutar audio");
      setPlayingId(null);
    };
    try {
      await a.play();
    } catch {
      setPlayingId(null);
    }
  }

  async function previewCurrent() {
    if (!text.trim()) return;
    if (playingId === "__preview") {
      stopAudio();
      return;
    }
    setPreviewBusy(true);
    try {
      const { dataUrl } = await generateVoiceFn({ data: { text, voice } });
      await playDataUrl("__preview", dataUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat preview");
    } finally {
      setPreviewBusy(false);
    }
  }

  async function saveClip() {
    if (!user || !text.trim()) return;
    setBusy(true);
    try {
      const { dataUrl } = await generateVoiceFn({ data: { text, voice } });
      const v = await voiceService.create(user.id, text, dataUrl, voice);
      setItems((p) => [v, ...p]);
      setText("");
      toast.success("Tersimpan di library");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (playingId === id) stopAudio();
    await voiceService.remove(id);
    setItems((p) => p.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Anime <span className="gradient-brand-text">Voice</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Ketik sebuah kalimat (Bahasa Indonesia juga oke), pilih suara, lalu simpan ke library.
        </p>
      </div>
      <div className="glass rounded-3xl p-4 space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik kalimat, monolog atau dialog singkat…"
          className="min-h-32 bg-transparent resize-none border-0 focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Voice:</span>
            {(["Kore", "Aoede", "Leda", "Zephyr"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setVoice(v)}
                className={`px-3 py-1 rounded-full border ${voice === v ? "bg-brand text-white border-transparent" : "border-border hover:bg-accent"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={previewCurrent}
              disabled={!text.trim() || previewBusy}
              className="rounded-full"
            >
              {playingId === "__preview" ? (
                <>
                  <Pause className="h-4 w-4 mr-1" /> Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" /> {previewBusy ? "Membuat…" : "Preview"}
                </>
              )}
            </Button>
            <Button
              onClick={saveClip}
              disabled={busy || !text.trim()}
              className="rounded-full bg-brand text-background border-0 hover:bg-brand/90"
            >
              <Mic className="h-4 w-4 mr-1" /> {busy ? "Menyimpan…" : "Save voice"}
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((v) => (
          <div key={v.id} className="glass rounded-2xl p-4 flex items-center gap-4">
            <div className="h-10 w-10 grid place-items-center rounded-full bg-brand">
              <Mic className="h-4 w-4 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{v.text}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(v.created_at).toLocaleString()}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={() =>
                playingId === v.id ? stopAudio() : v.audio_url && playDataUrl(v.id, v.audio_url)
              }
              aria-label={playingId === v.id ? "Stop" : "Play"}
              disabled={!v.audio_url}
            >
              {playingId === v.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            {v.audio_url && (
              <Button size="icon" variant="ghost" className="rounded-full" asChild>
                <a href={v.audio_url} download={`serion-voice-${v.id}.mp3`}>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full"
              onClick={() => remove(v.id)}
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground">Belum ada klip.</p>}
      </div>
    </div>
  );
}
