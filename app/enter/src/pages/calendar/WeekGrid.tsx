import { useTranslation } from "react-i18next";
import { Lock } from "lucide-react";
import { minutesLabel, pacificToUtc, slotMinutes, todayPacific, weekdayOf, formatYmd } from "@/lib/pacific";
import { cn } from "@/lib/utils";
import type { CalendarBooking } from "@/lib/crm";

type Props = { days: string[]; bookings: CalendarBooking[]; onOpen: (b: CalendarBooking) => void };

const ROWS = slotMinutes(2); // Tuesday has the longest day (until 6 PM)

/** Mon–Sat × 30-minute slot grid for one consultant. */
export function WeekGrid({ days, bookings, onOpen }: Props) {
  const { t, i18n } = useTranslation();
  const today = todayPacific();
  const byMs = new Map(bookings.map((b) => [Date.parse(b.slot_start), b]));

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-card">
      <div className="grid min-w-[820px]" style={{ gridTemplateColumns: `72px repeat(${days.length}, minmax(0, 1fr))` }}>
        <div className="sticky left-0 z-10 border-b bg-muted/60" />
        {days.map((d) => (
          <div key={d} className={cn("border-b border-l px-2 py-2.5 text-center", d === today ? "bg-gold-soft" : "bg-muted/60")}>
            <p className="text-xs font-medium uppercase text-muted-foreground">{formatYmd(d, i18n.language, { weekday: "short" })}</p>
            <p className={cn("text-sm font-bold", d === today ? "text-gold-foreground" : "text-primary")}>{formatYmd(d, i18n.language, { month: "short", day: "numeric" })}</p>
          </div>
        ))}
        {ROWS.map((m) => (
          <div key={m} className="contents">
            <div className="sticky left-0 z-10 border-b bg-card px-2 py-1.5 text-right text-[11px] tabular-nums text-muted-foreground">{minutesLabel(m, i18n.language)}</div>
            {days.map((d) => {
              const open = slotMinutes(weekdayOf(d)).includes(m);
              const b = open ? byMs.get(pacificToUtc(d, m).getTime()) : undefined;
              return (
                <div key={d} className={cn("min-h-11 border-b border-l p-1", !open && "bg-muted/50")}>
                  {b &&
                    (b.customers ? (
                      <button
                        type="button"
                        onClick={() => onOpen(b)}
                        className="flex h-full w-full flex-col items-start rounded-md border-l-4 border-gold bg-primary-soft px-2 py-1 text-left text-xs transition-colors hover:bg-primary hover:text-primary-foreground"
                      >
                        <span className="font-semibold leading-tight">{b.customers.name}</span>
                        <span className="text-[10px] opacity-70">{minutesLabel(m, i18n.language)}</span>
                      </button>
                    ) : (
                      <div className="flex h-full w-full items-center gap-1 rounded-md border border-dashed bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        {t("calendar.demoHold")}
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
