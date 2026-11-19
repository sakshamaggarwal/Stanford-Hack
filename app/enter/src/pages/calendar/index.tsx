import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/PageHeader";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import { useBookings, useConsultants, useStaff } from "@/hooks/use-crm";
import { addDays, formatYmd, mondayOf, pacificToUtc, todayPacific } from "@/lib/pacific";
import type { CalendarBooking } from "@/lib/crm";
import { WeekGrid } from "./WeekGrid";

export default function CalendarPage() {
  const { t, i18n } = useTranslation();
  const { data: staff } = useStaff();
  const { data: consultants } = useConsultants();
  const [week, setWeek] = useState(() => mondayOf(todayPacific()));
  const [picked, setPicked] = useState<string | null>(null);
  const [selected, setSelected] = useState<CalendarBooking | null>(null);

  const isAdmin = staff?.role === "admin";
  const consultantId = isAdmin ? (picked ?? consultants?.[0]?.id ?? null) : (staff?.consultant?.id ?? null);
  const days = Array.from({ length: 6 }, (_, i) => addDays(week, i));
  const { data: bookings, isLoading } = useBookings(pacificToUtc(week, 0).toISOString(), pacificToUtc(addDays(week, 6), 0).toISOString(), consultantId);
  const customerCount = bookings?.filter((b) => b.customers).length ?? 0;
  const holdCount = (bookings?.length ?? 0) - customerCount;

  return (
    <div className="space-y-5">
      <PageHeader
        title={isAdmin ? t("calendar.titleAll") : t("calendar.titleMine")}
        subtitle={isAdmin ? t("calendar.subtitleAll") : `${staff?.consultant?.code ?? ""} · ${staff?.consultant?.name ?? ""} · ${t("calendar.subtitleMine")}`}
      />

      {isAdmin && consultants && (
        <Tabs value={consultantId ?? undefined} onValueChange={setPicked}>
          <TabsList className="h-auto flex-wrap justify-start">
            {consultants.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="gap-1.5">
                <span className="rounded bg-gold-soft px-1.5 text-[10px] font-bold text-gold-foreground">{c.code}</span>
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label={t("calendar.prevWeek")} onClick={() => setWeek(addDays(week, -7))}><ChevronLeft /></Button>
          <Button variant="outline" onClick={() => setWeek(mondayOf(todayPacific()))}>{t("calendar.thisWeek")}</Button>
          <Button variant="outline" size="icon" aria-label={t("calendar.nextWeek")} onClick={() => setWeek(addDays(week, 7))}><ChevronRight /></Button>
          <span className="ml-2 text-sm font-semibold text-primary">
            {formatYmd(week, i18n.language, { month: "short", day: "numeric" })} – {formatYmd(days[5], i18n.language, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("calendar.summary", { count: customerCount, holds: holdCount })} · {t("calendar.pacific")}
        </p>
      </div>

      {isLoading || !consultantId ? (
        <Skeleton className="h-[600px] rounded-xl" />
      ) : (
        <WeekGrid days={days} bookings={bookings ?? []} onOpen={setSelected} />
      )}

      <CustomerDialog
        customerId={selected?.customer_id ?? null}
        slotStart={selected?.slot_start ?? null}
        mode={isAdmin ? "admin" : "consultant"}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
