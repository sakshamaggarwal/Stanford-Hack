import type { Customer } from "@/lib/crm";

export type Filters = {
  q: string;
  hotOnly: boolean;
  booked: "all" | "yes" | "no";
  loan: "all" | "yes" | "no";
  need: string;
  sort: "default" | "scoreDesc" | "scoreAsc";
};

export const defaultFilters: Filters = { q: "", hotOnly: false, booked: "all", loan: "all", need: "all", sort: "default" };

export function applyFilters(list: Customer[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  const out = list.filter(
    (c) =>
      (!q || [c.name, c.email, c.phone ?? "", c.buying_preferences?.preferred_areas ?? ""].some((s) => s.toLowerCase().includes(q))) &&
      (!f.hotOnly || c.hot) &&
      (f.booked === "all" || c.meeting_scheduled === (f.booked === "yes")) &&
      (f.loan === "all" || c.potential_loan_customer === (f.loan === "yes")) &&
      (f.need === "all" || c.need_type === f.need),
  );
  if (f.sort !== "default") {
    const dir = f.sort === "scoreDesc" ? -1 : 1;
    out.sort((a, b) => dir * ((a.buying_preferences?.capability_score ?? -1) - (b.buying_preferences?.capability_score ?? -1)));
  }
  return out;
}
