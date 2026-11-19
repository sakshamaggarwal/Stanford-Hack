import { useTranslation } from "react-i18next";
import { formatTime } from "@/lib/pacific";
import { cn } from "@/lib/utils";
import type { Slot } from "@/lib/scheduler-api";

type Props = { slots: Slot[]; selected: string | null; onSelect: (start: string) => void };

/** 30-minute slots for one day, each available (with seats left) or unavailable. */
export function SlotGrid({ slots, selected, onSelect }: Props) {
  const { t, i18n } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((s) => {
        const open = !s.past && s.seatsLeft > 0;
        const active = selected === s.start;
        return (
          <button
            key={s.start}
            type="button"
            disabled={!open}
            onClick={() => onSelect(s.start)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left transition-all",
              open && !active && "bg-card hover:border-gold hover:shadow-card",
              active && "border-primary bg-primary text-primary-foreground shadow-elevated",
              !open && "cursor-not-allowed border-dashed bg-muted text-muted-foreground",
            )}
          >
            <span className={cn("block text-sm font-semibold", !open && "line-through decoration-muted-foreground/50")}>{formatTime(s.start, i18n.language)}</span>
            <span className={cn("block text-[11px]", active ? "text-primary-foreground/80" : open ? (s.seatsLeft <= 2 ? "text-terracotta" : "text-success") : "")}>
              {s.past ? t("book.past") : open ? t("book.seatsLeft", { count: s.seatsLeft }) : t("book.unavailable")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
