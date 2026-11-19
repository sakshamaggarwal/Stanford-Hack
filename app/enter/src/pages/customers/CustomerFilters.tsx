import { useTranslation } from "react-i18next";
import { Flame, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCrmLabels } from "@/hooks/use-crm-labels";
import { NEED_TYPES } from "@/lib/crm";
import type { Filters } from "./filters";

export function CustomerFilters({ value, onChange }: { value: Filters; onChange: (f: Filters) => void }) {
  const { t } = useTranslation();
  const labels = useCrmLabels();
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...value, [k]: v });

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder={t("filters.search")} value={value.q} onChange={(e) => set("q", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Toggle
          variant="outline"
          pressed={value.hotOnly}
          onPressedChange={(v) => set("hotOnly", v)}
          className="gap-1.5 bg-background data-[state=on]:border-terracotta data-[state=on]:bg-terracotta-soft data-[state=on]:text-terracotta"
        >
          <Flame className="h-4 w-4" />
          {t("filters.hotOnly")}
        </Toggle>
        <Select value={value.booked} onValueChange={(v) => set("booked", v as Filters["booked"])}>
          <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allBookings")}</SelectItem>
            <SelectItem value="yes">{t("filters.booked")}</SelectItem>
            <SelectItem value="no">{t("filters.notBooked")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={value.loan} onValueChange={(v) => set("loan", v as Filters["loan"])}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allLoan")}</SelectItem>
            <SelectItem value="yes">{t("filters.loanYes")}</SelectItem>
            <SelectItem value="no">{t("filters.loanNo")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={value.need} onValueChange={(v) => set("need", v)}>
          <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allNeeds")}</SelectItem>
            {NEED_TYPES.map((n) => <SelectItem key={n} value={n}>{labels.need[n]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={value.sort} onValueChange={(v) => set("sort", v as Filters["sort"])}>
          <SelectTrigger className="col-span-2 sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t("filters.sortDefault")}</SelectItem>
            <SelectItem value="scoreDesc">{t("filters.sortScoreDesc")}</SelectItem>
            <SelectItem value="scoreAsc">{t("filters.sortScoreAsc")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
