import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, MessagesSquare, ImageIcon, Mic, ArrowRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Navbar } from "@/components/serion/Navbar";
import { Footer } from "@/components/serion/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SERION — Your Anime AI Companion" },
      {
        name: "description",
        content:
          "Create anime artwork, chat with anime AI assistants, and generate expressive anime voices — all inside one premium AI platform.",
      },
      { property: "og:title", content: "SERION — Your Anime AI Companion" },
      {
        property: "og:description",
        content: "Anime Chat, Anime Art, and Anime Voice in one beautifully crafted AI platform.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* HERO */}
      <section className="relative pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0 aurora opacity-70 pointer-events-none" />
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_oklab,var(--foreground)_8%,transparent)_1px,transparent_0)] [background-size:24px_24px] opacity-30 pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs">
              <Sparkles className="h-3 w-3 text-brand" />
              <span className="text-muted-foreground">Premium Anime AI Platform · 2026</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
              <span className="gradient-brand-text animate-gradient">SERION</span>
              <span className="block mt-2 text-3xl md:text-5xl text-foreground/90 font-bold">
                Your Anime AI Companion
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Create anime-inspired artwork. Chat naturally with anime AI assistants. Generate
              expressive anime voices. Everything inside one beautiful AI platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full gradient-brand text-background border-0 hover:opacity-90 h-12 px-6"
              >
                <Link to="/auth">
                  Get Started <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-6">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative aspect-square max-w-md mx-auto"
          >
            <div className="absolute inset-0 gradient-brand rounded-[2.5rem] blur-3xl opacity-40 animate-pulse-glow" />
            <div className="relative h-full w-full rounded-[2.5rem] glass p-8 grid place-items-center overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                className="absolute inset-6 rounded-[2rem] border border-dashed border-foreground/10"
              />
              <div className="relative grid grid-cols-2 gap-4 w-full">
                {[MessagesSquare, ImageIcon, Mic, Wand2].map((Icon, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                    className="aspect-square rounded-2xl glass grid place-items-center"
                  >
                    <Icon className="h-8 w-8 text-brand" />
                  </motion.div>
                ))}
              </div>
            </div>
            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-2 w-2 rounded-full gradient-brand"
                style={{
                  top: `${10 + i * 13}%`,
                  left: `${5 + ((i * 17) % 90)}%`,
                }}
                animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="mx-auto max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-5">
        {[
          {
            icon: MessagesSquare,
            title: "Anime Chat",
            desc: "Talk naturally with anime-focused AI assistants.",
            to: "/chat",
          },
          {
            icon: ImageIcon,
            title: "Anime Art",
            desc: "Generate anime-style illustrations from text prompts.",
            to: "/art",
          },
          {
            icon: Mic,
            title: "Anime Voice",
            desc: "Generate expressive anime voices in seconds.",
            to: "/voice",
          },
        ].map((q, i) => (
          <motion.div
            key={q.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={q.to}
              className="group block p-6 rounded-3xl glass hover:glow-brand transition-shadow relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition gradient-brand mix-blend-overlay" />
              <q.icon className="h-10 w-10 text-brand mb-4" />
              <h3 className="text-xl font-semibold mb-1">{q.title}</h3>
              <p className="text-sm text-muted-foreground">{q.desc}</p>
              <div className="mt-4 text-sm text-brand inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                Open <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Three AI surfaces. <span className="gradient-brand-text">One platform.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built for anime fans who want premium AI tools without the clutter.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: MessagesSquare,
              title: "Anime Chat",
              desc: "Conversations that feel real — pick a character, set the tone, go.",
            },
            {
              icon: ImageIcon,
              title: "Anime Art",
              desc: "Cinematic anime stills, key visuals, and character portraits.",
            },
            {
              icon: Mic,
              title: "Anime Voice",
              desc: "Expressive voices for stories, scripts, and short clips.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="p-6 rounded-3xl glass hover:-translate-y-1 transition-transform"
            >
              <div className="h-12 w-12 rounded-2xl gradient-brand grid place-items-center mb-5">
                <f.icon className="h-6 w-6 text-background" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Frequently asked</h2>
        </div>
        <Accordion type="single" collapsible className="glass rounded-3xl px-2">
          {[
            [
              "What is SERION?",
              "SERION is a premium AI platform built for anime fans — combining Anime Chat, Anime Art, and Anime Voice in a single beautifully designed product.",
            ],
            [
              "How does Anime Chat work?",
              "Pick a character, start a thread, and chat naturally. Each character has its own voice, tone, and personality.",
            ],
            [
              "Can I generate anime artwork?",
              "Yes — describe what you want and SERION will generate anime-style illustrations you can save, favorite, and download.",
            ],
            [
              "Can I create anime voices?",
              "Yes — type a script, choose a style, and SERION renders an expressive anime voice clip.",
            ],
            [
              "Will more characters be added?",
              "Constantly. New companions are added regularly based on community requests.",
            ],
          ].map(([q, a]) => (
            <AccordionItem key={q} value={q} className="border-border/40">
              <AccordionTrigger className="text-left px-4 hover:no-underline">{q}</AccordionTrigger>
              <AccordionContent className="px-4 text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Footer />
    </div>
  );
}
