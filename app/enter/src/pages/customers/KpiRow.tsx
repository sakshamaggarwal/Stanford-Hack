import { useTranslation } from "react-i18next";
import { CalendarCheck, Flame, MailCheck, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEmailCount } from "@/hooks/use-crm";
import type { Customer } from "@/lib/crm";

export function KpiRow({ customers }: { customers: Customer[] }) {
  const { t } = useTranslation();
  const { data: emails } = useEmailCount();
  const items = [
    { label: t("kpi.total"), value: customers.length, icon: Users, tone: "bg-primary-soft text-primary" },
    { label: t("kpi.booked"), value: customers.filter((c) => c.meeting_scheduled).length, icon: CalendarCheck, tone: "bg-success-soft text-success" },
    { label: t("kpi.hot"), value: customers.filter((c) => c.hot).length, icon: Flame, tone: "bg-terracotta-soft text-terracotta" },
    { label: t("kpi.emails"), value: emails ?? "—", icon: MailCheck, tone: "bg-gold-soft text-gold-foreground" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((k) => (
        <Card key={k.label} className="flex items-center gap-3 p-4">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${k.tone}`}>
            <k.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold tabular-nums text-primary">{k.value}</p>
            <p className="text-xs text-muted-foreground">{k.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
