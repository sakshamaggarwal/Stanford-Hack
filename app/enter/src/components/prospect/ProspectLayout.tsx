import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/language-switcher";

/** Mobile-first shell for public prospect pages. */
export const ProspectLayout = ({ children, footer = true }: { children: ReactNode; footer?: boolean }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Logo />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-5">{children}</main>
      {footer && (
        <footer className="mx-auto flex max-w-2xl items-start gap-2 px-4 pb-6 text-[11px] leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
          {t("prospectPage.disclaimer")}
        </footer>
      )}
    </div>
  );
};

export const ProspectMessage = ({ title, body, icon }: { title: string; body: string; icon: ReactNode }) => (
  <div className="m-auto max-w-sm rounded-2xl border bg-card p-8 text-center shadow-card">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft text-gold">{icon}</div>
    <h1 className="text-xl font-bold text-primary">{title}</h1>
    <p className="mt-2 text-sm text-muted-foreground">{body}</p>
  </div>
);
