import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Direct Google Gemini API. Set GEMINI_API_KEY in your .env
// Get a free key at: https://aistudio.google.com/app/apikey
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_OPENAI_BASE = "https://generativelanguage.googleapis.com/v1beta/openai";

function geminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY. Tambahkan ke file .env kamu.");
  return key;
}

/* ----------------------------- Chat reply ----------------------------- */

const ChatInput = z.object({
  character: z
    .object({
      name: z.string(),
      anime: z.string().optional(),
      description: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).max(40),
});

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const persona = data.character;
    const system = persona
      ? `Kamu adalah ${persona.name}${persona.anime ? ` dari anime ${persona.anime}` : ""}. ${
          persona.description ?? ""
        }\n\nGaya bicara: ${(persona.tags ?? []).join(", ")}.\n\nATURAN PENTING:\n- Default bahasa: Bahasa Indonesia yang natural dan santai.\n- Jika pengguna menulis dalam bahasa lain, balas dalam bahasa yang sama.\n- Tetap dalam karakter ${persona.name}, hangat dan ekspresif, gunakan emoji sesekali.\n- Jawaban singkat–sedang seperti chat (1–4 kalimat) kecuali diminta detail.`
      : `Kamu adalah SERION, asisten anime AI. Default bahasa: Bahasa Indonesia yang natural. Jika pengguna pakai bahasa lain, balas dengan bahasa itu. Jawab singkat dan ramah.`;

    const r = await fetch(`${GEMINI_OPENAI_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${geminiKey()}`,
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...data.history],
      }),
    });
    if (!r.ok) throw new Error(`Gemini ${r.status}: ${await r.text()}`);
    const json = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return { content: json.choices?.[0]?.message?.content ?? "" };
  });

/* --------------------------- Image generation ------------------------- */

const ImageInput = z.object({ prompt: z.string().min(1).max(2000) });

export const generateImageFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ImageInput.parse(d))
  .handler(async ({ data }) => {
    const model = "gemini-2.5-flash-image";
    const r = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${geminiKey()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${data.prompt}\n\nGaya: anime key visual, cinematic lighting, highly detailed.`,
              },
            ],
          },
        ],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    });
    if (!r.ok) throw new Error(`Gemini image ${r.status}: ${await r.text()}`);
    const json = (await r.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
      }>;
    };
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) {
      if (p.inlineData?.data) {
        const mime = p.inlineData.mimeType ?? "image/png";
        return { dataUrl: `data:${mime};base64,${p.inlineData.data}` };
      }
    }
    throw new Error("No image returned");
  });

/* ---------------------------- Voice (TTS) ----------------------------- */

const VoiceInput = z.object({
  text: z.string().min(1).max(4000),
  // Female-sounding Gemini prebuilt voices first
  voice: z.enum(["Kore", "Aoede", "Leda", "Zephyr", "Puck", "Charon"]).default("Kore"),
});

export const generateVoiceFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => VoiceInput.parse(d))
  .handler(async ({ data }) => {
    const model = "gemini-2.5-flash-preview-tts";
    const r = await fetch(`${GEMINI_BASE}/models/${model}:generateContent?key=${geminiKey()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: data.text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: data.voice } },
          },
        },
      }),
    });
    if (!r.ok) throw new Error(`Gemini TTS ${r.status}: ${await r.text()}`);
    const json = (await r.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }> };
      }>;
    };
    const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    const inline = part?.inlineData;
    if (!inline?.data) throw new Error("No audio returned");
    // Gemini returns raw PCM (e.g. "audio/L16;codec=pcm;rate=24000"). Wrap as WAV.
    const mime = inline.mimeType ?? "audio/L16;rate=24000";
    const rateMatch = /rate=(\d+)/.exec(mime);
    const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
    const pcmBin = atob(inline.data);
    const pcm = new Uint8Array(pcmBin.length);
    for (let i = 0; i < pcmBin.length; i++) pcm[i] = pcmBin.charCodeAt(i);
    const wav = pcmToWav(pcm, sampleRate);
    let wavBin = "";
    for (let i = 0; i < wav.length; i++) wavBin += String.fromCharCode(wav[i]);
    return { dataUrl: `data:audio/wav;base64,${btoa(wavBin)}` };
  });

function pcmToWav(pcm: Uint8Array, sampleRate: number, channels = 1, bitsPerSample = 16) {
  const blockAlign = (channels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(buffer);
  const w = (o: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
  };
  w(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  w(8, "WAVE");
  w(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  w(36, "data");
  view.setUint32(40, pcm.length, true);
  const out = new Uint8Array(buffer);
  out.set(pcm, 44);
  return out;
}
