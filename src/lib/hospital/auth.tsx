import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type Role = "admin" | "doctor" | "patient" | "receptionist";

export const roleHome: Record<Role, string> = {
  admin: "/dashboard/admin",
  doctor: "/dashboard/doctor",
  receptionist: "/dashboard/receptionist",
  patient: "/dashboard/patient",
};

type Ctx = {
  user: User | null;
  session: Session | null;
  role: Role | null;
  loading: boolean;
  roleLoading: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>({ user: null, session: null, role: null, loading: true, roleLoading: true, refreshRole: async () => {}, signOut: async () => {} });

/** Highest-privilege role wins when an account holds more than one row. */
const ROLE_PRIORITY: Role[] = ["admin", "doctor", "receptionist", "patient"];

/** Reads the signed-in user's role from user_roles. Returns null when it cannot be determined. */
export async function fetchRole(userId: string): Promise<Role | null> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) {
    console.error("Failed to load role", error);
    return null;
  }
  const roles = (data ?? []).map((r) => r.role as Role);
  return ROLE_PRIORITY.find((r) => roles.includes(r)) ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        setRoleLoading(true);
        setTimeout(async () => {
          setRole(await fetchRole(s.user.id));
          setRoleLoading(false);
        }, 0);
      } else {
        setRole(null);
        setRoleLoading(false);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        setRole(await fetchRole(data.session.user.id));
      }
      setRoleLoading(false);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshRole = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    setRoleLoading(true);
    setRole(await fetchRole(data.user.id));
    setRoleLoading(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthCtx.Provider value={{ user: session?.user ?? null, session, role, loading, roleLoading, refreshRole, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);