import { useTranslation } from "react-i18next";
import { CalendarCheck2, CalendarClock, Mail, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatLongDate, formatTime } from "@/lib/pacific";

type Props = { slotStart: string; consultantName: string; justBooked: boolean; onReschedule: () => void };

export function BookingConfirmed({ slotStart, consultantName, justBooked, onReschedule }: Props) {
  const { t, i18n } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="bg-gradient-hero px-6 py-7 text-center text-primary-foreground">
        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-gold text-gold-foreground">
          <CalendarCheck2 className="h-6 w-6" />
        </span>
        <h1 className="text-xl font-bold">{justBooked ? t("book.confirmedTitle") : t("book.existingTitle")}</h1>
        <p className="mt-1 text-sm text-primary-foreground/80">{t("book.confirmedBody")}</p>
      </div>
      <div className="space-y-3 p-6">
        <div className="flex items-start gap-3 rounded-xl bg-gold-soft p-4">
          <CalendarClock className="mt-0.5 h-5 w-5 text-gold" />
          <div>
            <p className="font-semibold text-primary">{formatLongDate(slotStart, i18n.language)}</p>
            <p className="text-sm text-muted-foreground">{formatTime(slotStart, i18n.language)} · {t("book.thirtyMin")} · {t("book.pacific")}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl bg-primary-soft p-4">
          <UserRound className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">{t("book.yourConsultant")}</p>
            <p className="font-semibold text-primary">{consultantName}</p>
          </div>
        </div>
        {justBooked && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-gold" />
            {t("book.emailNote")}
          </p>
        )}
        <Button variant="outline" className="w-full" onClick={onReschedule}>
          <RefreshCw />
          {t("book.reschedule")}
        </Button>
      </div>
    </div>
  );
}
