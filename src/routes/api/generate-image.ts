import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt } = (await request.json()) as { prompt: string };
        const key = process.env.GEMINI_API_KEY;
        if (!key) return new Response("Missing GEMINI_API_KEY", { status: 500 });

        const model = "gemini-2.5-flash-image";
        const upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `${prompt}\n\nGaya: anime key visual, cinematic lighting, highly detailed.`,
                    },
                  ],
                },
              ],
              generationConfig: { responseModalities: ["IMAGE"] },
            }),
          },
        );
        if (!upstream.ok) {
          const errorText = await upstream.text();

          console.error("Gemini Error:");
          console.error(errorText);

          return new Response(errorText, {
            status: upstream.status,
          });
        }
        const json = (await upstream.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ inlineData?: { data?: string } }> };
          }>;
        };
        const b64 = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)
          ?.inlineData?.data;
        if (!b64) return new Response("No image returned", { status: 502 });

        const sse =
          `event: image_generation.completed\n` + `data: ${JSON.stringify({ b64_json: b64 })}\n\n`;
        return new Response(sse, {
          headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      },
    },
  },
});
