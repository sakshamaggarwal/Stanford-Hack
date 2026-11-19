import { useTranslation } from "react-i18next";
import { CalendarClock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerEditor } from "@/components/customers/CustomerEditor";
import { EmailLogList } from "@/components/customers/EmailLogList";
import { useCustomer } from "@/hooks/use-crm";
import { formatDateTime } from "@/lib/pacific";

type Props = { customerId: string | null; slotStart: string | null; mode: "admin" | "consultant"; onClose: () => void };

/** Customer profile + preferences + notes, opened from a calendar booking. */
export function CustomerDialog({ customerId, slotStart, mode, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useCustomer(customerId);

  return (
    <Dialog open={!!customerId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary">{data?.name ?? t("calendar.customer")}</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-gold" />
            {slotStart ? `${formatDateTime(slotStart, i18n.language)} PT` : ""}
            {data && ` · ${data.email} · ${data.phone ?? ""}`}
          </DialogDescription>
        </DialogHeader>
        {isLoading || !data ? (
          <Skeleton className="h-80" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <CustomerEditor key={data.id} customer={data} mode={mode} />
            <EmailLogList customerId={data.id} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
