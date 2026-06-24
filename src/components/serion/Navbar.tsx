import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/lib/auth-context";

const nav = [
  { to: "/", label: "Home" },
  { to: "/#features", label: "Features" },
  { to: "/#characters", label: "Characters" },
  { to: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const { user } = useAuth();
  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <nav className="glass flex items-center justify-between rounded-2xl px-4 py-2.5">
          <Logo />
          <ul className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {nav.map((n) => (
              <li key={n.to}>
                <a
                  href={n.to}
                  className="rounded-full px-3 py-1.5 transition hover:text-foreground hover:bg-accent"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button asChild size="sm" className="rounded-full">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full hidden sm:inline-flex"
                >
                  <Link to="/auth">Login</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full gradient-brand text-background border-0 hover:opacity-90"
                >
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
