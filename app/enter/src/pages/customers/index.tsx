import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCustomers } from "@/hooks/use-crm";
import { KpiRow } from "./KpiRow";
import { CustomerFilters } from "./CustomerFilters";
import { applyFilters, defaultFilters } from "./filters";
import { CustomerTable } from "./CustomerTable";

export default function CustomersPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useCustomers();
  const [filters, setFilters] = useState(defaultFilters);
  const list = useMemo(() => applyFilters(data ?? [], filters), [data, filters]);

  return (
    <div className="space-y-5">
      <PageHeader title={t("customers.title")} subtitle={t("customers.subtitle")} />
      {isLoading ? (
        <Skeleton className="h-96 rounded-xl" />
      ) : error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive">{t("common.loadError")}</p>
      ) : (
        <>
          <KpiRow customers={data ?? []} />
          <CustomerFilters value={filters} onChange={setFilters} />
          <p className="text-xs text-muted-foreground">{t("customers.showing", { count: list.length, total: data?.length ?? 0 })}</p>
          <div className="overflow-x-auto">
            <CustomerTable customers={list} />
          </div>
        </>
      )}
    </div>
  );
}
