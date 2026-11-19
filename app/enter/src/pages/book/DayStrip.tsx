import { useTranslation } from "react-i18next";
import { formatYmd } from "@/lib/pacific";
import { cn } from "@/lib/utils";
import type { Availability } from "@/lib/scheduler-api";

type Props = { days: Availability["days"]; selected: string | null; onSelect: (date: string) => void };

/** Horizontally scrolling Mon–Sat day chips with open-slot counts. */
export function DayStrip({ days, selected, onSelect }: Props) {
  const { t, i18n } = useTranslation();
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-thin">
      {days.map((d) => {
        const open = d.slots.filter((s) => !s.past && s.seatsLeft > 0).length;
        const active = selected === d.date;
        return (
          <button
            key={d.date}
            type="button"
            disabled={!open}
            onClick={() => onSelect(d.date)}
            className={cn(
              "flex w-[74px] shrink-0 flex-col items-center rounded-xl border px-2 py-2.5 transition-all",
              active ? "border-primary bg-primary text-primary-foreground shadow-elevated" : "bg-card hover:border-gold",
              !open && "cursor-not-allowed bg-muted text-muted-foreground opacity-70 hover:border-border",
            )}
          >
            <span className="text-[11px] font-medium uppercase">{formatYmd(d.date, i18n.language, { weekday: "short" })}</span>
            <span className="text-lg font-bold leading-tight">{formatYmd(d.date, i18n.language, { day: "numeric" })}</span>
            <span className="text-[10px]">{formatYmd(d.date, i18n.language, { month: "short" })}</span>
            <span className={cn("mt-1 text-[10px] font-semibold", active ? "text-gold" : open ? "text-success" : "")}>
              {open ? t("book.openCount", { count: open }) : t("book.full")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
