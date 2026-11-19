import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarX2, Clock, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProspectLayout, ProspectMessage } from "@/components/prospect/ProspectLayout";
import { callScheduler, type Availability, type BookingResult } from "@/lib/scheduler-api";
import { formatLongDate, formatTime } from "@/lib/pacific";
import { DayStrip } from "./DayStrip";
import { SlotGrid } from "./SlotGrid";
import { BookingConfirmed } from "./BookingConfirmed";

export default function BookPage() {
  const { token = "" } = useParams();
  const { t, i18n } = useTranslation();
  const qc = useQueryClient();
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState(false);
  const [justBooked, setJustBooked] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["availability", token],
    queryFn: () => callScheduler<Availability>({ action: "availability", token }),
    retry: false,
  });

  const book = useMutation({
    mutationFn: (slotStart: string) => callScheduler<BookingResult>({ action: "book", token, slotStart, origin: window.location.origin }),
    onSuccess: () => {
      setJustBooked(true);
      setRescheduling(false);
      setSlot(null);
      void qc.invalidateQueries({ queryKey: ["availability", token] });
    },
    onError: (e) => {
      toast.error(e.message === "slot_full" ? t("book.errorFull") : t("book.errorGeneric"));
      void qc.invalidateQueries({ queryKey: ["availability", token] });
      setSlot(null);
    },
  });

  if (isLoading) {
    return (
      <ProspectLayout>
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="mt-4 h-80 rounded-2xl" />
      </ProspectLayout>
    );
  }
  if (error || !data) {
    return (
      <ProspectLayout>
        <ProspectMessage title={t("book.invalidTitle")} body={t("book.invalidBody")} icon={<CalendarX2 className="h-6 w-6" />} />
      </ProspectLayout>
    );
  }

  const booking = book.data?.booking ?? data.booking;
  if (booking && !rescheduling && Date.parse(booking.slotStart) > Date.now()) {
    return (
      <ProspectLayout>
        <BookingConfirmed
          slotStart={booking.slotStart}
          consultantName={booking.consultantName}
          justBooked={justBooked}
          onReschedule={() => {
            setRescheduling(true);
            setJustBooked(false);
            book.reset();
          }}
        />
      </ProspectLayout>
    );
  }

  const firstOpen = data.days.find((d) => d.slots.some((s) => !s.past && s.seatsLeft > 0))?.date ?? null;
  const activeDay = day ?? firstOpen;
  const dayData = data.days.find((d) => d.date === activeDay);

  return (
    <ProspectLayout>
      <div className="space-y-5 pb-24">
        <section className="rounded-2xl bg-gradient-hero p-6 text-primary-foreground shadow-elevated">
          <p className="text-sm text-primary-foreground/80">{t("book.hi", { name: data.customer.firstName })}</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight">{rescheduling ? t("book.titleReschedule") : t("book.title")}</h1>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-primary-foreground/80">
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-gold" />{t("book.metaDuration")}</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold" />{t("book.metaAssign")}</span>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-primary">{t("book.pickDay")}</h2>
          <DayStrip days={data.days} selected={activeDay} onSelect={(d) => { setDay(d); setSlot(null); }} />
        </section>

        {dayData && (
          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold text-primary">{formatLongDate(dayData.slots[0].start, i18n.language)}</h2>
              <span className="text-xs text-muted-foreground">{t("book.pacific")}</span>
            </div>
            <SlotGrid slots={dayData.slots} selected={slot} onSelect={setSlot} />
          </section>
        )}
      </div>

      {slot && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-primary">{formatLongDate(slot, i18n.language)}</p>
              <p className="text-muted-foreground">{formatTime(slot, i18n.language)} · {t("book.pacific")}</p>
            </div>
            <Button size="lg" variant="gold" disabled={book.isPending} onClick={() => book.mutate(slot)}>
              {book.isPending && <Loader2 className="animate-spin" />}
              {t("book.confirm")}
            </Button>
          </div>
        </div>
      )}
    </ProspectLayout>
  );
}
