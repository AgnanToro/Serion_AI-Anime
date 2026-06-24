import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand">
        <span className="text-sm font-black text-background">S</span>
      </span>
      <span className="text-lg">SERION</span>
    </Link>
  );
}
