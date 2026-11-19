import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CalendarDays, KeyRound, Loader2, ShieldCheck, UserCog } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

const DEMO_PASSWORD = "Demo2026!";
const DEMO_ACCOUNTS = [
  { email: "admin@ohfy-demo.com", name: "Jerry Zhang", code: "Admin" },
  { email: "sakshamtech12@gmail.com", name: "Saksham", code: "Admin" },
  { email: "grace@ohfy-demo.com", name: "Grace Liu", code: "C1" },
  { email: "daniel@ohfy-demo.com", name: "Daniel Wong", code: "C2" },
  { email: "emily@ohfy-demo.com", name: "Emily Chen", code: "C3" },
  { email: "kevin@ohfy-demo.com", name: "Kevin Park", code: "C4" },
  { email: "sophia@ohfy-demo.com", name: "Sophia Lin", code: "C5" },
];

export default function Login() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const signIn = async (e?: string, p?: string) => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e ?? email, password: p ?? password });
    setBusy(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-hero p-12 text-primary-foreground lg:flex">
        <Logo tone="light" />
        <div className="max-w-md">
          <h1 className="text-4xl font-bold leading-tight">{t("auth.heroTitle")}</h1>
          <p className="mt-4 text-primary-foreground/80">{t("auth.heroBody")}</p>
        </div>
        <p className="flex items-center gap-2 text-sm text-primary-foreground/70">
          <ShieldCheck className="h-4 w-4 text-gold" />
          {t("auth.heroFoot")}
        </p>
      </div>
      <div className="flex flex-col bg-surface p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Logo className="lg:invisible" showTagline={false} />
          <LanguageSwitcher />
        </div>
        <div className="m-auto w-full max-w-md space-y-6 py-8">
          <div>
            <h2 className="text-2xl font-bold text-primary">{t("auth.welcome")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void signIn();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("field.email")}</Label>
              <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {t("auth.signIn")}
            </Button>
          </form>

          <div className="rounded-xl border border-dashed border-gold bg-gold-soft/50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <KeyRound className="h-4 w-4 text-gold" />
              {t("auth.demoTitle")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("auth.demoBody")} <code className="rounded bg-background px-1.5 py-0.5 font-mono font-semibold text-foreground">{DEMO_PASSWORD}</code>
            </p>
            <div className="mt-3 grid gap-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(DEMO_PASSWORD);
                    void signIn(a.email, DEMO_PASSWORD);
                  }}
                  className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-gold hover:bg-background disabled:opacity-60"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    {a.code === "Admin" ? <UserCog className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">
                      {a.name} <span className="text-xs text-muted-foreground">· {a.code === "Admin" ? t("auth.roleAdmin") : `${a.code} ${t("auth.roleConsultant")}`}</span>
                    </span>
                    <span className="block truncate font-mono text-xs text-muted-foreground">{a.email}</span>
                  </span>
                  <span className="text-xs font-semibold text-gold-foreground">{t("auth.quickSignIn")}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
