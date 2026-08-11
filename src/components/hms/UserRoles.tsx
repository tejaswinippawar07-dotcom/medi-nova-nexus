import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Role } from "@/lib/hospital/auth";
import { useAuth } from "@/lib/hospital/auth";

type Row = { id: string; full_name: string | null; phone: string | null; created_at: string; role: Role | null };

const ROLES: Role[] = ["admin", "doctor", "receptionist", "patient"];

export function UserRoles() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: profiles, error }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, phone, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    const map = new Map((roles ?? []).map((r) => [r.user_id, r.role as Role]));
    setRows((profiles ?? []).map((p) => ({ ...p, role: map.get(p.id) ?? null })));
  }, []);

  useEffect(() => { void load(); }, [load]);

  const setRole = async (row: Row, role: Role) => {
    if (row.role === role) return;
    if (row.id === user?.id && role !== "admin") {
      toast.error("You can't remove your own admin access — ask another admin to do it.");
      return;
    }
    setBusy(row.id);
    // Insert first, then remove the old roles: deleting first can strip the acting
    // admin's own privileges mid-change and make the follow-up insert fail.
    const ins = await supabase.from("user_roles").insert({ user_id: row.id, role });
    if (ins.error) { setBusy(null); toast.error(ins.error.message); return; }
    const del = await supabase.from("user_roles").delete().eq("user_id", row.id).neq("role", role);
    setBusy(null);
    if (del.error) { toast.error(del.error.message); return; }
    toast.success(`Role updated to ${role}.`);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, role } : r)));
  };

  return (
    <Card className="rounded-3xl border-border/60 p-6 shadow-card">
      <h2 className="text-lg font-semibold">Users &amp; roles</h2>
      <p className="text-sm text-muted-foreground">
        Every account starts as a patient. Grant staff access here — role changes take effect at the user's next page load.
      </p>
      {loading ? (
        <div className="mt-6 text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">No accounts yet.</div>
      ) : (
        <div className="mt-4 divide-y divide-border/60">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <div className="text-sm font-semibold">{r.full_name ?? "Unnamed account"}</div>
                <div className="text-xs text-muted-foreground">{r.phone ?? "No phone"} · {r.id.slice(0, 8)}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={r.role === "admin" ? "default" : "outline"}>{r.role ?? "no role"}</Badge>
                <Select value={r.role ?? undefined} disabled={busy === r.id} onValueChange={(v) => void setRole(r, v as Role)}>
                  <SelectTrigger className="w-44"><SelectValue placeholder="Assign role" /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
