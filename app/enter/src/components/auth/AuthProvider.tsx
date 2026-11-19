import { useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext, type AuthState } from "@/lib/auth-context";

/** Keeps user + session in sync with Enter Cloud auth; clears cached data on account change. */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true });
  const lastUser = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      if (lastUser.current !== undefined && lastUser.current !== uid) {
        setTimeout(() => qc.clear(), 0);
      }
      lastUser.current = uid;
      setState({ user: session?.user ?? null, session, loading: false });
    });
    supabase.auth.getSession().then(({ data }) => {
      lastUser.current = data.session?.user?.id ?? null;
      setState({ user: data.session?.user ?? null, session: data.session, loading: false });
    });
    return () => sub.subscription.unsubscribe();
  }, [qc]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};
