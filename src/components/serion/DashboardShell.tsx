import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MessagesSquare,
  ImageIcon,
  Mic,
  Users,
  History,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { CHARACTERS } from "@/lib/characters";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Anime Chat", icon: MessagesSquare },
  { to: "/art", label: "Anime Art", icon: ImageIcon },
  { to: "/voice", label: "Anime Voice", icon: Mic },
  { to: "/characters", label: "Characters", icon: Users },
  { to: "/history", label: "History", icon: History },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await authService.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto`}
      >
        <div className="p-5">
          <Logo />
        </div>
        <nav className="px-3 space-y-1">
          {items.map((it) => {
            const active = pathname === it.to;
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-brand text-white"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </Link>
            );
          })}
        </nav>
        {/* Characters list */}
        <div className="mt-6 px-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70 mb-2">
            Characters
          </p>
        </div>
        <div className="px-3 space-y-1 flex-1">
          {CHARACTERS.map((c) => {
            const target = `/chat?c=${c.id}`;
            return (
              <Link
                key={c.id}
                to="/chat"
                search={{ c: c.id } as never}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition"
                title={target}
              >
                <img
                  src={c.avatar_url}
                  alt={c.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{c.anime}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 glass border-b border-border/60 flex items-center justify-between px-4 lg:px-8 h-14">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
