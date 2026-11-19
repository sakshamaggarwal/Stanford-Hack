import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ChevronDown, Flame, Loader2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomerEditor } from "@/components/customers/CustomerEditor";
import { EmailLogList } from "@/components/customers/EmailLogList";
import { ScoreBadge } from "@/components/customers/ScoreBadge";
import { useCrmLabels } from "@/hooks/use-crm-labels";
import { useSendFollowUp, useUpdateCustomer } from "@/hooks/use-crm";
import { formatDateTime } from "@/lib/pacific";
import { cn } from "@/lib/utils";
import type { Customer } from "@/lib/crm";

function RowActions({ customer }: { customer: Customer }) {
  const { t } = useTranslation();
  const update = useUpdateCustomer();
  const followUp = useSendFollowUp();

  const send = () =>
    followUp.mutate(customer.id, {
      onSuccess: (r) =>
        toast.success(r.type === "reminder" ? t("followUp.reminderSent") : t("followUp.inviteSent"), { description: `${t("followUp.deliveredTo")} ${r.sentTo}` }),
      onError: (e) => toast.error(t("followUp.failed"), { description: e.message }),
    });

  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="soft" onClick={send} disabled={followUp.isPending}>
            {followUp.isPending ? <Loader2 className="animate-spin" /> : <Mail />}
            <span className="hidden xl:inline">{t("followUp.button")}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{customer.meeting_scheduled ? t("followUp.tipReminder") : t("followUp.tipInvite")}</TooltipContent>
      </Tooltip>
      <Button
        size="icon"
        variant="ghost"
        aria-pressed={customer.hot}
        aria-label={t("field.hot")}
        className={cn("h-9 w-9", customer.hot ? "bg-terracotta-soft text-terracotta hover:bg-terracotta-soft" : "text-muted-foreground")}
        disabled={update.isPending}
        onClick={() => update.mutate({ id: customer.id, patch: { hot: !customer.hot } })}
      >
        <Flame className={cn(customer.hot && "fill-current")} />
      </Button>
    </div>
  );
}

export function CustomerTable({ customers }: { customers: Customer[] }) {
  const { t, i18n } = useTranslation();
  const labels = useCrmLabels();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-card">
      <Table className="min-w-[860px]">
        <TableHeader>
          <TableRow className="bg-muted/60 hover:bg-muted/60">
            <TableHead className="w-10" />
            <TableHead>{t("table.customer")}</TableHead>
            <TableHead>{t("table.need")}</TableHead>
            <TableHead>{t("table.timeline")}</TableHead>
            <TableHead>{t("table.score")}</TableHead>
            <TableHead>{t("table.meeting")}</TableHead>
            <TableHead>{t("table.loan")}</TableHead>
            <TableHead className="text-right">{t("table.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => {
            const isOpen = open === c.id;
            return (
              <Fragment key={c.id}>
                <TableRow className={cn("cursor-pointer", isOpen && "bg-primary-soft/50 hover:bg-primary-soft/50")} onClick={() => setOpen(isOpen ? null : c.id)}>
                  <TableCell>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      {c.name}
                      {c.hot && <Flame className="h-3.5 w-3.5 fill-current text-terracotta" />}
                    </div>
                    <div className="text-xs text-muted-foreground">{c.email}</div>
                  </TableCell>
                  <TableCell><Badge variant="tag">{labels.need[c.need_type]}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{labels.timeline[c.timeline]}</TableCell>
                  <TableCell><ScoreBadge score={c.buying_preferences?.capability_score} /></TableCell>
                  <TableCell>
                    {c.meeting_scheduled && c.last_appointment ? (
                      <div>
                        <Badge variant="success">{formatDateTime(c.last_appointment, i18n.language)}</Badge>
                        {c.consultants && <div className="mt-1 text-xs text-muted-foreground">{c.consultants.code} · {c.consultants.name}</div>}
                      </div>
                    ) : (
                      <Badge variant="muted">{t("table.notBooked")}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.potential_loan_customer ? "bilingual" : "muted"}>{c.potential_loan_customer ? t("common.yes") : t("common.no")}</Badge>
                  </TableCell>
                  <TableCell><RowActions customer={c} /></TableCell>
                </TableRow>
                {isOpen && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={8} className="bg-surface p-0">
                      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_300px]">
                        <CustomerEditor key={`${c.id}-${c.buying_preferences?.capability_score}-${c.hot}`} customer={c} mode="admin" />
                        <EmailLogList customerId={c.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
          {!customers.length && (
            <TableRow>
              <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">{t("table.empty")}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
