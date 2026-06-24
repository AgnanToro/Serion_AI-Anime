import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Logo } from "@/components/serion/Logo";
import { ThemeToggle } from "@/components/serion/ThemeToggle";
import { authService } from "@/services/authService";
import { useAuth } from "@/lib/auth-context";
import { MessagesSquare, ImageIcon, Mic } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SERION" },
      { name: "description", content: "Sign in or create your SERION account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen relative grid lg:grid-cols-2">
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>
      <div className="absolute top-5 left-5 z-10">
        <Logo />
      </div>

      <div className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 aurora" />
        <div className="absolute inset-0 grid place-items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="h-96 w-96 rounded-full gradient-brand opacity-40 blur-3xl"
          />
        </div>
        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex-1" />
          <div>
            <h2 className="text-4xl font-bold tracking-tight">
              <span className="gradient-brand-text">Welcome to SERION</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-sm">
              The premium anime AI platform. Chat, art, and voice — beautifully unified.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-sm">
            {[
              { icon: MessagesSquare, label: "Anime Chat" },
              { icon: ImageIcon, label: "Anime Art" },
              { icon: Mic, label: "Anime Voice" },
            ].map((f) => (
              <motion.div
                key={f.label}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
              >
                <div className="h-10 w-10 rounded-xl gradient-brand grid place-items-center text-background">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in or create an account to continue.
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-full">
              <TabsTrigger value="signin" className="rounded-full">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">
                Sign up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>

          <p className="text-xs text-muted-foreground text-center">
            <Link to="/" className="hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-3 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await authService.signIn(email, password);
        setBusy(false);
        if (error) return toast.error(error.message);
        toast.success("Welcome back!");
        navigate({ to: "/dashboard" });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="si-email">Email</Label>
        <Input
          id="si-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="si-pw">Password</Label>
        <Input
          id="si-pw"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={busy}
        className="w-full rounded-full gradient-brand text-background border-0 h-11"
      >
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-3 mt-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const { error } = await authService.signUp(email, password, {
          username,
          display_name: username,
        });
        setBusy(false);
        if (error) return toast.error(error.message);
        toast.success("Account created. Welcome to SERION!");
        navigate({ to: "/dashboard" });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="su-user">Username</Label>
        <Input
          id="su-user"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-email">Email</Label>
        <Input
          id="su-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="su-pw">Password</Label>
        <Input
          id="su-pw"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        disabled={busy}
        className="w-full rounded-full gradient-brand text-background border-0 h-11"
      >
        {busy ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}
