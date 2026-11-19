import { House, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

type LogoProps = { className?: string; tone?: "light" | "dark"; showTagline?: boolean };

/** OwnHomeForYou wordmark with house/key mark. */
export const Logo = ({ className, tone = "dark", showTagline = true }: LogoProps) => (
  <div className={cn("flex items-center gap-2.5", className)}>
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-gold text-gold-foreground shadow-sm">
      <House className="h-5 w-5" strokeWidth={2.2} />
      <KeyRound className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary p-0.5 text-gold" strokeWidth={2.4} />
    </span>
    <span className="leading-tight">
      <span className={cn("block text-[17px] font-extrabold tracking-tight", tone === "light" ? "text-sidebar-accent-foreground" : "text-primary")}>
        Own<span className="text-gold">Home</span>ForYou
      </span>
      {showTagline && (
        <span className={cn("block text-[11px] font-medium", tone === "light" ? "text-sidebar-foreground/70" : "text-muted-foreground")}>
          Journey to your home · 安家之路
        </span>
      )}
    </span>
  </div>
);
