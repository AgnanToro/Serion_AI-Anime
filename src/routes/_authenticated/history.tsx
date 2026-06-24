import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessagesSquare, ImageIcon, Mic } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { chatService, type ChatThread } from "@/services/chatService";
import { imageService, type GeneratedImage } from "@/services/imageService";
import { voiceService, type GeneratedVoice } from "@/services/voiceService";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [voices, setVoices] = useState<GeneratedVoice[]>([]);

  useEffect(() => {
    if (!user) return;
    chatService.listThreads(user.id).then(setThreads);
    imageService.list(user.id).then(setImages);
    voiceService.list(user.id).then(setVoices);
  }, [user]);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight">History</h1>
      <Tabs defaultValue="chat">
        <TabsList className="rounded-full">
          <TabsTrigger value="chat" className="rounded-full">
            <MessagesSquare className="h-4 w-4 mr-1" /> Chats
          </TabsTrigger>
          <TabsTrigger value="art" className="rounded-full">
            <ImageIcon className="h-4 w-4 mr-1" /> Art
          </TabsTrigger>
          <TabsTrigger value="voice" className="rounded-full">
            <Mic className="h-4 w-4 mr-1" /> Voice
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="mt-4 space-y-2">
          {threads.map((t) => (
            <div key={t.id} className="glass rounded-2xl px-4 py-3 flex justify-between">
              <span className="truncate">{t.title}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(t.updated_at).toLocaleString()}
              </span>
            </div>
          ))}
          {threads.length === 0 && <p className="text-sm text-muted-foreground">No chats yet.</p>}
        </TabsContent>
        <TabsContent value="art" className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {images.map((i) => (
            <div key={i.id} className="glass rounded-2xl p-3">
              <div className="aspect-square rounded-xl overflow-hidden bg-accent mb-2">
                {i.image_url && (
                  <img src={i.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{i.prompt}</p>
            </div>
          ))}
          {images.length === 0 && <p className="text-sm text-muted-foreground">No images yet.</p>}
        </TabsContent>
        <TabsContent value="voice" className="mt-4 space-y-2">
          {voices.map((v) => (
            <div key={v.id} className="glass rounded-2xl px-4 py-3">
              <p className="text-sm truncate">{v.text}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(v.created_at).toLocaleString()}
              </p>
            </div>
          ))}
          {voices.length === 0 && <p className="text-sm text-muted-foreground">No voices yet.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
