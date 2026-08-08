import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X, CalendarClock, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/hospital/fields";

export type Appointment = {
  id: string;
  doctor_name: string;
  doctor_id: string | null;
  department: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: string;
  patient_record_id: string | null;
};

type Props = {
  title: string;
  description?: string;
  /** Limit to one doctor's list. */
  doctorId?: string;
  /** Limit to the signed-in patient's own bookings. */
  patientUserId?: string;
  /** Only show these statuses. */
  statuses?: string[];
  /** Only today's date. */
  todayOnly?: boolean;
  /** Which workflow buttons to show. */
  actions?: ("approve" | "reject" | "complete" | "cancel" | "reschedule")[];
  patientLabels?: Record<string, string>;
};

const tone = (s: string) =>
  s === "confirmed" ? "secondary" : s === "completed" ? "outline" : s === "cancelled" ? "destructive" : "default";

export function AppointmentQueue({
  title, description, doctorId, patientUserId, statuses, todayOnly, actions = [], patientLabels,
}: Props) {
  const [rows, setRows] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [reschedule, setReschedule] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("appointments").select("*").order("appointment_date", { ascending: false });
    if (doctorId) q = q.eq("doctor_id", doctorId);
    if (patientUserId) q = q.eq("patient_id", patientUserId);
    if (todayOnly) q = q.eq("appointment_date", today);
    const { data, error } = await q;
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setRows((data as unknown as Appointment[]) ?? []);
  }, [doctorId, patientUserId, todayOnly, today]);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(
    () => (statuses ? rows.filter((r) => statuses.includes(r.status)) : rows),
    [rows, statuses],
  );

  const setStatus = async (row: Appointment, status: string) => {
    setBusy(row.id);
    const { error } = await supabase.from("appointments").update({ status }).eq("id", row.id);
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`Appointment ${status}.`);
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
  };

  const saveReschedule = async () => {
    if (!reschedule || !newDate || !newTime) { toast.error("Pick a new date and time."); return; }
    const { error } = await supabase
      .from("appointments")
      .update({ appointment_date: newDate, appointment_time: newTime, status: "pending" })
      .eq("id", reschedule.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Appointment rescheduled — awaiting confirmation.");
    setReschedule(null);
    void load();
  };

  return (
    <Card className="rounded-3xl border-border/60 p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button variant="ghost" size="icon" aria-label="Refresh" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-muted-foreground">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          Nothing here right now.
        </div>
      ) : (
        <div className="mt-4 divide-y divide-border/60">
          {visible.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="min-w-56">
                <div className="text-sm font-semibold">
                  {patientLabels?.[a.patient_record_id ?? ""] ?? a.doctor_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {patientLabels ? `${a.doctor_name} · ` : ""}{a.department} · {formatDate(a.appointment_date)} at {a.appointment_time}
                </div>
                {a.reason && <div className="mt-1 max-w-md text-xs text-muted-foreground/80">{a.reason}</div>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={tone(a.status) as "default" | "secondary" | "outline" | "destructive"}>{a.status}</Badge>
                {actions.includes("approve") && a.status === "pending" && (
                  <Button size="sm" className="rounded-full" disabled={busy === a.id} onClick={() => void setStatus(a, "confirmed")}>
                    <Check className="mr-1 h-3 w-3" /> Approve
                  </Button>
                )}
                {actions.includes("reject") && a.status === "pending" && (
                  <Button size="sm" variant="outline" className="rounded-full" disabled={busy === a.id} onClick={() => void setStatus(a, "cancelled")}>
                    <X className="mr-1 h-3 w-3" /> Reject
                  </Button>
                )}
                {actions.includes("complete") && a.status === "confirmed" && (
                  <Button size="sm" variant="secondary" className="rounded-full" disabled={busy === a.id} onClick={() => void setStatus(a, "completed")}>
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Mark completed
                  </Button>
                )}
                {actions.includes("reschedule") && ["pending", "confirmed"].includes(a.status) && (
                  <Button size="sm" variant="outline" className="rounded-full"
                    onClick={() => { setReschedule(a); setNewDate(a.appointment_date); setNewTime(a.appointment_time); }}>
                    <CalendarClock className="mr-1 h-3 w-3" /> Reschedule
                  </Button>
                )}
                {actions.includes("cancel") && ["pending", "confirmed"].includes(a.status) && (
                  <Button size="sm" variant="ghost" className="rounded-full text-destructive" disabled={busy === a.id} onClick={() => void setStatus(a, "cancelled")}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!reschedule} onOpenChange={(o) => !o && setReschedule(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Reschedule appointment</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="rs-date">New date</Label><Input id="rs-date" className="mt-2" type="date" value={newDate} min={today} onChange={(e) => setNewDate(e.target.value)} /></div>
            <div><Label htmlFor="rs-time">New time</Label><Input id="rs-time" className="mt-2" type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReschedule(null)}>Cancel</Button>
            <Button onClick={() => void saveReschedule()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
