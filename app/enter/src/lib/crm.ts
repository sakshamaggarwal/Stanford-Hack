import type { Database } from "@/integrations/supabase/types";

type Tables = Database["public"]["Tables"];
export type CustomerRow = Tables["customers"]["Row"];
export type PreferencesRow = Tables["buying_preferences"]["Row"];
export type ConsultantRow = Tables["consultants"]["Row"];
export type BookingRow = Tables["bookings"]["Row"];
export type EmailLogRow = Tables["email_log"]["Row"];

export type Customer = CustomerRow & {
  buying_preferences: PreferencesRow | null;
  consultants: Pick<ConsultantRow, "id" | "code" | "name"> | null;
};

export type CalendarBooking = BookingRow & { customers: Pick<CustomerRow, "id" | "name"> | null };

export const NEED_TYPES = ["buy", "sell", "purchase_loan", "refinance", "learning"] as const;
export const TIMELINES = ["lt3", "3to6", "6to12", "12plus"] as const;
export const MARITAL = ["single", "married", "other"] as const;

export type Role = "admin" | "consultant" | "none";

export const formatMoney = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

/** Mirrors the database formula: min(10, round(20 × income ÷ budget, 1)). */
export const capabilityScore = (income?: number | null, budget?: number | null) =>
  !income || !budget || budget <= 0 ? null : Math.min(10, Math.round((20 * income) / budget * 10) / 10);

export const scoreTone = (s: number | null | undefined) =>
  s == null ? "muted" : s >= 6 ? "success" : s >= 3.5 ? "warning" : "danger";
