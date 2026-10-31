import { useEffect, useState } from "react";
import { ClipboardList, HeartPulse, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, historyCategoryLabel } from "@/lib/hospital/fields";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type HistoryRow = { id: string; category: string; title: string; details: string | null; status: string };
type VitalRow = {
  id: string; recorded_at: string; blood_pressure: string | null; pulse: number | null;
  temperature_c: unknown; spo2: number | null; weight_kg: unknown; height_cm: unknown; notes: string | null;
};
type NoteRow = {
  id: string; visit_date: string; diagnosis: string; treatment_plan: string | null;
  doctor_notes: string | null; follow_up_date: string | null; follow_up_notes: string | null;
  doctors: { name: string | null } | null;
};

/** Read-only view of the patient's own medical record (RLS limits it to their data). */
export function PatientRecords({ patientId }: { patientId: string }) {
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [vitals, setVitals] = useState<VitalRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    void Promise.all([
      supabase.from("patient_history").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
      supabase.from("vitals").select("*").eq("patient_id", patientId).order("recorded_at", { ascending: false }),
      supabase.from("clinical_notes").select("*, doctors (name)").eq("patient_id", patientId).order("visit_date", { ascending: false }),
    ]).then(([h, v, n]) => {
      if (!alive) return;
      setHistory((h.data as unknown as HistoryRow[]) ?? []);
      setVitals((v.data as unknown as VitalRow[]) ?? []);
      setNotes((n.data as unknown as NoteRow[]) ?? []);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [patientId]);

  if (loading) return <div className="text-sm text-muted-foreground">Loading your medical record…</div>;

  const followUps = notes.filter((n) => n.follow_up_date);

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border-border/60 p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><History className="h-4 w-4" /> Medical history &amp; allergies</h2>
        {history.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            Nothing recorded yet. Your care team adds allergies and conditions here.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {history.map((h) => (
              <li key={h.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium">{h.title} <span className="text-xs font-normal text-muted-foreground">· {historyCategoryLabel(h.category)}</span></div>
                  {h.details && <div className="text-xs text-muted-foreground">{h.details}</div>}
                </div>
                <Badge variant={h.status === "active" ? "default" : "outline"}>{h.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="rounded-3xl border-border/60 p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><ClipboardList className="h-4 w-4" /> Consultations &amp; diagnosis</h2>
        {notes.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No consultation notes yet.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border/60">
            {notes.map((n) => (
              <li key={n.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">{n.diagnosis}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(n.visit_date)}{n.doctors?.name ? ` · ${n.doctors.name}` : ""}</div>
                </div>
                {n.treatment_plan && <div className="mt-1 text-xs text-muted-foreground">Treatment: {n.treatment_plan}</div>}
                {n.doctor_notes && <div className="mt-1 text-xs text-muted-foreground">Notes: {n.doctor_notes}</div>}
                {n.follow_up_date && (
                  <div className="mt-1 text-xs font-medium text-primary">
                    Follow-up on {formatDate(n.follow_up_date)}{n.follow_up_notes ? ` — ${n.follow_up_notes}` : ""}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {followUps.length > 0 && (
          <p className="mt-4 rounded-xl bg-accent/40 p-3 text-xs text-muted-foreground">
            You have {followUps.length} scheduled follow-up{followUps.length === 1 ? "" : "s"}. Book a visit on or before the follow-up date above.
          </p>
        )}
      </Card>

      <Card className="rounded-3xl border-border/60 p-6 shadow-card">
        <h2 className="flex items-center gap-2 text-lg font-semibold"><HeartPulse className="h-4 w-4" /> Vital signs</h2>
        {vitals.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No vitals recorded yet.
          </div>
        ) : (
          <div className="-mx-6 mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="py-2 pr-4">Recorded</th><th className="py-2 pr-4">BP</th><th className="py-2 pr-4">Pulse</th><th className="py-2 pr-4">Temp</th><th className="py-2 pr-4">SpO₂</th><th className="py-2 pr-4">Weight</th><th className="py-2">Height</th></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {vitals.map((v) => (
                  <tr key={v.id}>
                    <td className="py-2 pr-4 whitespace-nowrap">{formatDate(v.recorded_at.slice(0, 10))}</td>
                    <td className="py-2 pr-4">{v.blood_pressure ?? "—"}</td>
                    <td className="py-2 pr-4">{v.pulse ?? "—"}</td>
                    <td className="py-2 pr-4">{v.temperature_c ? `${v.temperature_c}°C` : "—"}</td>
                    <td className="py-2 pr-4">{v.spo2 ? `${v.spo2}%` : "—"}</td>
                    <td className="py-2 pr-4">{v.weight_kg ? `${v.weight_kg} kg` : "—"}</td>
                    <td className="py-2">{v.height_cm ? `${v.height_cm} cm` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
