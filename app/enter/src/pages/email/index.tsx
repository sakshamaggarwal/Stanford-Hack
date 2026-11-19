import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, MailX, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProspectMessage } from "@/components/prospect/ProspectLayout";
import { callScheduler } from "@/lib/scheduler-api";
import { formatLongDate, formatTime } from "@/lib/pacific";

type EmailView = { name: string; booking: { slotStart: string; consultantName: string } | null };

/** Hosted web version of the follow-up emails (Chinese by default from the email link, with an English switch). */
export default function EmailPage() {
  const { token = "" } = useParams();
  const [params] = useSearchParams();
  const { t } = useTranslation();
  const lng = params.get("lang") === "en" ? "en" : "zh-CN";
  const other = lng === "en" ? "zh-CN" : "en";
  const { data, isLoading, error } = useQuery({
    queryKey: ["email-view", token],
    queryFn: () => callScheduler<EmailView>({ action: "email_view", token }),
    retry: false,
  });

  const wrap = (children: React.ReactNode) => <div className="min-h-[100dvh] bg-secondary px-3 py-6">{children}</div>;
  if (isLoading) return wrap(<Skeleton className="mx-auto h-96 max-w-xl rounded-2xl" />);
  if (error || !data) return wrap(<ProspectMessage title={t("book.invalidTitle")} body={t("book.invalidBody")} icon={<MailX className="h-6 w-6" />} />);

  const booking = params.get("type") === "reminder" ? data.booking : null;
  const first = data.name.split(" ")[0];
  const about = t("emailView.about", { lng });

  return wrap(
    <div className="mx-auto max-w-xl" lang={lng}>
      <div className="px-1 pb-2 text-right text-xs">
        <Link to={`/email/${token}?type=${params.get("type") ?? "invite"}&lang=${other}`} className="font-medium text-gold-foreground hover:underline">
          {lng === "en" ? "查看中文版" : "View in English"}
        </Link>
      </div>
      <div className="rounded-t-2xl bg-primary px-7 py-6">
        <p className="text-xl font-extrabold text-primary-foreground">
          Own<span className="text-gold">Home</span>ForYou
        </p>
        <p className="text-xs text-primary-foreground/70">Journey to your home · 安家之路</p>
      </div>
      <div className="space-y-4 rounded-b-2xl bg-card px-7 py-7 text-[15px] leading-relaxed shadow-card">
        <p>{t("emailView.greeting", { lng, name: first })}</p>
        {booking ? (
          <>
            <p>{t("emailView.thanksBooked", { lng })}</p>
            <div className="space-y-3 rounded-xl bg-gold-soft p-5">
              <div className="flex items-start gap-3">
                <CalendarClock className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("emailView.when", { lng })}</p>
                  <p className="text-lg font-bold text-primary">
                    {formatLongDate(booking.slotStart, lng)} · {formatTime(booking.slotStart, lng)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("emailView.pacific", { lng })}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 h-5 w-5 text-gold" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("emailView.consultant", { lng })}</p>
                  <p className="font-semibold text-primary">{booking.consultantName}</p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">{about}</p>
            <p>
              {t("emailView.rescheduleLead", { lng })}{" "}
              <Link to={`/book/${token}`} className="font-semibold text-gold-foreground underline">{t("emailView.rescheduleLink", { lng })}</Link>
            </p>
          </>
        ) : (
          <>
            <p>{t("emailView.thanks", { lng })}</p>
            <p className="text-muted-foreground">{about}</p>
            <div className="py-2 text-center">
              <Button asChild size="lg" variant="gold" className="h-12 px-8 text-base font-bold">
                <Link to={`/book/${token}`}>{t("emailView.cta", { lng })}</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t("emailView.ctaNote", { lng })}</p>
          </>
        )}
      </div>
      <p className="px-2 py-4 text-center text-[11px] text-muted-foreground">GCFRI · OwnHomeForYou · California</p>
    </div>,
  );
}
