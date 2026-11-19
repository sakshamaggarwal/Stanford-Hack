import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { CalendarCheck, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScoreBadge } from "./ScoreBadge";
import { useCrmLabels } from "@/hooks/use-crm-labels";
import { useUpdateCustomer, useUpdatePreferences } from "@/hooks/use-crm";
import { capabilityScore, MARITAL, NEED_TYPES, TIMELINES, type Customer } from "@/lib/crm";
import { formatDateTime } from "@/lib/pacific";

type Mode = "admin" | "consultant";
const NUM_FIELDS = ["budget", "house_size_sqft", "bedrooms", "bathrooms", "household_size", "buyer_age", "credit_score", "annual_income"] as const;
type NumField = (typeof NUM_FIELDS)[number];

const toStr = (v: number | null | undefined) => (v == null ? "" : String(v));
const toNum = (v: string) => (v.trim() === "" ? null : Number(v));

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/** Editable profile + buying preferences. Consultants may edit notes, need type, timeline and preferences only. */
export function CustomerEditor({ customer, mode }: { customer: Customer; mode: Mode }) {
  const { t, i18n } = useTranslation();
  const labels = useCrmLabels();
  const updateCustomer = useUpdateCustomer();
  const updatePrefs = useUpdatePreferences();
  const prefs = customer.buying_preferences;
  const locked = mode === "consultant";

  const [c, setC] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone ?? "",
    need_type: customer.need_type,
    timeline: customer.timeline,
    potential_loan_customer: customer.potential_loan_customer,
    hot: customer.hot,
    notes: customer.notes,
  });
  const [p, setP] = useState({
    preferred_areas: prefs?.preferred_areas ?? "",
    marital_status: prefs?.marital_status ?? "",
    ...(Object.fromEntries(NUM_FIELDS.map((k) => [k, toStr(prefs?.[k])])) as Record<NumField, string>),
  });

  const saving = updateCustomer.isPending || updatePrefs.isPending;
  const liveScore = capabilityScore(toNum(p.annual_income), toNum(p.budget));

  const save = async () => {
    try {
      const customerPatch = locked
        ? { need_type: c.need_type, timeline: c.timeline, notes: c.notes }
        : { ...c, phone: c.phone || null };
      await updateCustomer.mutateAsync({ id: customer.id, patch: customerPatch });
      if (prefs) {
        await updatePrefs.mutateAsync({
          customerId: customer.id,
          patch: {
            preferred_areas: p.preferred_areas,
            marital_status: p.marital_status || null,
            ...Object.fromEntries(NUM_FIELDS.map((k) => [k, toNum(p[k])])),
          },
        });
      }
      toast.success(t("editor.saved"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("editor.saveFailed"));
    }
  };

  const num = (k: NumField, label: string, step = "1") => (
    <Field label={label}>
      <Input type="number" min={0} step={step} value={p[k]} onChange={(e) => setP({ ...p, [k]: e.target.value })} />
    </Field>
  );

  return (
    <div className="space-y-6">
      <section>
        <h4 className="mb-3 text-sm font-semibold text-primary">{t("editor.profile")}</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label={t("field.name")}>
            <Input value={c.name} disabled={locked} onChange={(e) => setC({ ...c, name: e.target.value })} />
          </Field>
          <Field label={t("field.email")}>
            <Input type="email" value={c.email} disabled={locked} onChange={(e) => setC({ ...c, email: e.target.value })} />
          </Field>
          <Field label={t("field.phone")}>
            <Input value={c.phone} disabled={locked} onChange={(e) => setC({ ...c, phone: e.target.value })} />
          </Field>
          <Field label={t("field.needType")}>
            <Select value={c.need_type} onValueChange={(v) => setC({ ...c, need_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {NEED_TYPES.map((n) => <SelectItem key={n} value={n}>{labels.need[n]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("field.timeline")}>
            <Select value={c.timeline} onValueChange={(v) => setC({ ...c, timeline: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIMELINES.map((n) => <SelectItem key={n} value={n}>{labels.timeline[n]}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-end gap-6 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={c.potential_loan_customer} disabled={locked} onCheckedChange={(v) => setC({ ...c, potential_loan_customer: v })} />
              {t("field.loanCustomer")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={c.hot} disabled={locked} onCheckedChange={(v) => setC({ ...c, hot: v })} />
              {t("field.hot")}
            </label>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarCheck className="h-3.5 w-3.5" />
            {t("field.meetingScheduled")}: <b className="text-foreground">{customer.meeting_scheduled ? t("common.yes") : t("common.no")}</b>
          </span>
          <span>
            {t("field.lastAppointment")}:{" "}
            <b className="text-foreground">{customer.last_appointment ? `${formatDateTime(customer.last_appointment, i18n.language)} PT` : "—"}</b>
          </span>
          <span>
            {t("field.consultant")}: <b className="text-foreground">{customer.consultants ? `${customer.consultants.code} · ${customer.consultants.name}` : "—"}</b>
          </span>
          <span className="italic">{t("editor.autoFields")}</span>
        </div>
      </section>

      {prefs && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-primary">{t("editor.preferences")}</h4>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {t("field.capabilityScore")} <ScoreBadge score={liveScore} />
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={t("field.preferredAreas")} className="sm:col-span-2">
              <Input value={p.preferred_areas} onChange={(e) => setP({ ...p, preferred_areas: e.target.value })} />
            </Field>
            {num("budget", t("field.budget"), "1000")}
            {num("annual_income", t("field.income"), "1000")}
            {num("house_size_sqft", t("field.houseSize"))}
            {num("bedrooms", t("field.bedrooms"))}
            {num("bathrooms", t("field.bathrooms"), "0.5")}
            {num("credit_score", t("field.creditScore"))}
            {num("household_size", t("field.householdSize"))}
            <Field label={t("field.maritalStatus")}>
              <Select value={p.marital_status || "none"} onValueChange={(v) => setP({ ...p, marital_status: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("common.notSet")}</SelectItem>
                  {MARITAL.map((m) => <SelectItem key={m} value={m}>{labels.marital[m]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            {num("buyer_age", t("field.buyerAge"))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{t("editor.scoreHint")}</p>
        </section>
      )}

      <section>
        <Field label={t("field.notes")}>
          <Textarea rows={3} value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} />
        </Field>
      </section>

      <div className="flex justify-end">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {t("editor.save")}
        </Button>
      </div>
    </div>
  );
}
