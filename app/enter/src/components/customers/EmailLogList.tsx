import { useTranslation } from "react-i18next";
import { CircleAlert, MailCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmailLog } from "@/hooks/use-crm";
import { useCrmLabels } from "@/hooks/use-crm-labels";
import { formatDateTime } from "@/lib/pacific";

/** Per-customer send log (type, time, status). */
export function EmailLogList({ customerId }: { customerId: string }) {
  const { t, i18n } = useTranslation();
  const labels = useCrmLabels();
  const { data, isLoading } = useEmailLog(customerId);

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-primary">{t("emailLog.title")}</h4>
      {isLoading ? (
        <Skeleton className="h-16" />
      ) : !data?.length ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">{t("emailLog.empty")}</p>
      ) : (
        <ul className="space-y-2">
          {data.map((e) => (
            <li key={e.id} className="flex gap-2.5 rounded-lg border bg-card p-2.5 text-xs">
              {e.status === "sent" ? (
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {labels.emailType[e.email_type]} · <span className="font-normal text-muted-foreground">{formatDateTime(e.sent_at, i18n.language)} PT</span>
                </p>
                <p className="truncate text-muted-foreground" title={e.subject}>{e.subject}</p>
                {e.status === "failed" ? (
                  <p className="text-destructive">{t("emailLog.failed")}: {e.error}</p>
                ) : (
                  <p className="text-muted-foreground">{t("emailLog.deliveredTo")} {e.sent_to}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
