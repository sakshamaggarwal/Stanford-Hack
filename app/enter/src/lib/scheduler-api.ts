import { supabase } from "@/integrations/supabase/client";

export type Slot = { start: string; seatsLeft: number; past: boolean };
export type Availability = {
  customer: { firstName: string };
  capacity: number;
  today: string;
  booking: { slotStart: string; consultantName: string } | null;
  days: { date: string; slots: Slot[] }[];
};
export type BookingResult = { booking: { slotStart: string; consultantName: string }; rescheduled?: boolean; emailStatus?: string };

/** Calls the public scheduler backend function and surfaces its error code. */
export async function callScheduler<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("crm", { body });
  if (error) {
    const ctx = (error as { context?: Response }).context;
    const detail = ctx ? await ctx.json().catch(() => null) : null;
    throw new Error(detail?.error ?? "server_error");
  }
  return data as T;
}
