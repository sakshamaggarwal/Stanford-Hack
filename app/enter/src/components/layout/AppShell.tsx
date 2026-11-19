import { useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarDays, LogOut, Menu, Settings, ShieldAlert, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useStaff } from "@/hooks/use-crm";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { data: staff } = useStaff();
  const items =
    staff?.role === "admin"
      ? [
          { to: "/", label: t("nav.customers"), icon: Users, end: true },
          { to: "/calendar", label: t("nav.calendars"), icon: CalendarDays },
          { to: "/settings", label: t("nav.settings"), icon: Settings },
        ]
      : [{ to: "/calendar", label: t("nav.myCalendar"), icon: CalendarDays }];
  return (
    <nav className="flex flex-col gap-1">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )
          }
        >
          <it.icon className="h-4 w-4" />
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: staff } = useStaff();
  const who = staff?.role === "admin" ? staff.adminName : staff?.consultant ? `${staff.consultant.code} · ${staff.consultant.name}` : user?.email;
  return (
    <div className="flex h-full flex-col gap-8 bg-sidebar p-5">
      <Logo tone="light" />
      <NavItems onNavigate={onNavigate} />
      <div className="mt-auto space-y-4">
        <LanguageSwitcher tone="light" />
        <div className="rounded-xl border border-sidebar-border p-3 text-xs text-sidebar-foreground/70">
          <p className="font-semibold text-sidebar-accent-foreground">{who}</p>
          <p>{staff?.role === "admin" ? t("shell.adminRole") : t("shell.consultantRole")}</p>
          <p className="mt-2 truncate">{user?.email}</p>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="mt-2 inline-flex items-center gap-1.5 font-medium text-sidebar-primary hover:underline"
          >
            <LogOut className="h-3.5 w-3.5" />
            {t("auth.signOut")}
          </button>
        </div>
      </div>
    </div>
  );
}

function NoAccess() {
  const { t } = useTranslation();
  return (
    <div className="m-auto max-w-sm space-y-4 rounded-2xl border bg-card p-8 text-center shadow-card">
      <ShieldAlert className="mx-auto h-10 w-10 text-warning" />
      <h1 className="text-lg font-bold text-primary">{t("shell.noAccessTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("shell.noAccessBody")}</p>
      <Button variant="outline" onClick={() => void supabase.auth.signOut()}>{t("auth.signOut")}</Button>
    </div>
  );
}

/** Staff workspace layout: fixed sidebar on desktop, sheet menu on mobile. Nav depends on role. */
export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { data: staff, isLoading } = useStaff();
  if (loading || (user && isLoading)) return <Skeleton className="m-8 h-96 rounded-2xl" />;
  if (!user) return <Navigate to="/login" replace />;
  if (staff?.role === "none") return <div className="flex min-h-screen p-6"><NoAccess /></div>;
  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarBody />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Logo showTagline={false} />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" aria-label={t("common.menu")} onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 border-0 p-0">
            <SheetTitle className="sr-only">{t("common.menu")}</SheetTitle>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
