import mizuharaAsset from "@/assets/characters/mizuhara.asset.json";
import anyaAsset from "@/assets/characters/anya.asset.json";
import willAsset from "@/assets/characters/will.asset.json";
import astaAsset from "@/assets/characters/asta.asset.json";
// Direct image imports as a fallback if the asset URL isn't served in your environment
import mizuharaPng from "@/assets/characters/mizuhara.png";
import anyaPng from "@/assets/characters/anya.png";
import willPng from "@/assets/characters/will.png";
import astaPng from "@/assets/characters/asta.png";

// Resolve avatar: prefer served URL if not the internal `/__l5e` dev path,
// otherwise use the bundled PNG fallback so images always display.
const resolveAvatar = (url?: string, fallback?: string) => {
  if (!url) return fallback;
  try {
    if (url.startsWith("/__l5e")) return fallback;
  } catch (e) {
    return fallback;
  }
  return url;
};

export type Character = {
  id: string;
  name: string;
  anime: string;
  description: string;
  tags: string[];
  avatar_url: string;
  accent_color: string;
};

/**
 * Static character roster.
 * Order matters — this is the order shown in the sidebar.
 */
export const CHARACTERS: Character[] = [
  {
    id: "mizuhara-chizuru",
    name: "Mizuhara Chizuru",
    anime: "Rent-a-Girlfriend",
    description: "A calm, mature presence who listens deeply and supports you through anything.",
    tags: ["Supportive", "Calm", "Mature"],
    avatar_url: resolveAvatar(mizuharaAsset.url, mizuharaPng),
    accent_color: "#6d28d9",
  },
  {
    id: "anya-forger",
    name: "Anya Forger",
    anime: "Spy × Family",
    description: "Playful, curious, and full of energy — Anya brings light to every conversation.",
    tags: ["Funny", "Cute", "Energetic"],
    avatar_url: resolveAvatar(anyaAsset.url, anyaPng),
    accent_color: "#6d28d9",
  },
  {
    id: "will-serfort",
    name: "Will Serfort",
    anime: "Wistoria",
    description: "A composed, intelligent companion with a thoughtful, magical perspective.",
    tags: ["Magic", "Calm", "Intelligent"],
    avatar_url: resolveAvatar(willAsset.url, willPng),
    accent_color: "#6d28d9",
  },
  {
    id: "asta",
    name: "Asta",
    anime: "Black Clover",
    description: "Relentlessly motivational warrior who reminds you to never give up.",
    tags: ["Energetic", "Motivational", "Warrior"],
    avatar_url: resolveAvatar(astaAsset.url, astaPng),
    accent_color: "#6d28d9",
  },
];

export const getCharacter = (id: string | null | undefined): Character | undefined =>
  id ? CHARACTERS.find((c) => c.id === id) : undefined;
