import { Github, MessageCircle, Twitter } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-sm">
            The premium Anime AI platform — chat, art, and voice in one place.
          </p>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#characters" className="hover:text-foreground">
            Characters
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3 text-muted-foreground">
          <a href="#" aria-label="GitHub" className="hover:text-foreground">
            <Github className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Discord" className="hover:text-foreground">
            <MessageCircle className="h-4 w-4" />
          </a>
          <a href="#" aria-label="X" className="hover:text-foreground">
            <Twitter className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SERION. All rights reserved.
      </div>
    </footer>
  );
}
