import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { CalendarBooking, ConsultantRow, Customer, CustomerRow, EmailLogRow, PreferencesRow, Role } from "@/lib/crm";

/** Who is signed in: admin, consultant (with their consultant row) or neither. Enforced server-side by RLS. */
export function useStaff() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["staff", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [admin, consultant] = await Promise.all([
        supabase.from("staff_admins").select("display_name").eq("user_id", user!.id).maybeSingle(),
        supabase.from("consultants").select("*").eq("user_id", user!.id).maybeSingle(),
      ]);
      const role: Role = admin.data ? "admin" : consultant.data ? "consultant" : "none";
      return { role, adminName: admin.data?.display_name ?? null, consultant: consultant.data as ConsultantRow | null };
    },
  });
}

export function useConsultants() {
  return useQuery({
    queryKey: ["consultants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("consultants").select("*").order("sort_order");
      if (error) throw error;
      return data as ConsultantRow[];
    },
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*, buying_preferences(*), consultants(id, code, name)")
        .order("created_at")
        .order("name");
      if (error) throw error;
      return data as unknown as Customer[];
    },
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: ["customer", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*, buying_preferences(*), consultants(id, code, name)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Customer | null;
    },
  });
}

export function useEmailLog(customerId: string | null) {
  return useQuery({
    queryKey: ["email-log", customerId],
    enabled: !!customerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("email_log").select("*").eq("customer_id", customerId!).order("sent_at", { ascending: false });
      if (error) throw error;
      return data as EmailLogRow[];
    },
  });
}

export function useEmailCount() {
  return useQuery({
    queryKey: ["email-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("email_log").select("id", { count: "exact", head: true }).eq("status", "sent");
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useBookings(fromIso: string, toIso: string, consultantId: string | null) {
  return useQuery({
    queryKey: ["bookings", fromIso, toIso, consultantId],
    enabled: !!consultantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, customers(id, name)")
        .eq("status", "booked")
        .eq("consultant_id", consultantId!)
        .gte("slot_start", fromIso)
        .lt("slot_start", toIso)
        .order("slot_start");
      if (error) throw error;
      return data as unknown as CalendarBooking[];
    },
  });
}

function useInvalidateCustomers() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ["customers"] });
    void qc.invalidateQueries({ queryKey: ["customer"] });
  };
}

export function useUpdateCustomer() {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<CustomerRow> }) => {
      const { error } = await supabase.from("customers").update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useUpdatePreferences() {
  const invalidate = useInvalidateCustomers();
  return useMutation({
    mutationFn: async ({ customerId, patch }: { customerId: string; patch: Partial<PreferencesRow> }) => {
      const { error } = await supabase.from("buying_preferences").update(patch as never).eq("customer_id", customerId);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });
}

export function useSendFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { data, error } = await supabase.functions.invoke("crm", {
        body: { action: "follow_up", customerId, origin: window.location.origin },
      });
      if (error) {
        const ctx = (error as { context?: Response }).context;
        const detail = ctx ? await ctx.json().catch(() => null) : null;
        throw new Error(detail?.error ?? error.message);
      }
      return data as { type: "reminder" | "booking_invite"; sentTo: string };
    },
    onSettled: (_d, _e, customerId) => {
      void qc.invalidateQueries({ queryKey: ["email-log", customerId] });
      void qc.invalidateQueries({ queryKey: ["email-count"] });
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (testInbox: string) => {
      const { error } = await supabase.from("app_settings").update({ test_inbox: testInbox, updated_at: new Date().toISOString() }).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
