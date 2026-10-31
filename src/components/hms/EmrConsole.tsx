import { useCallback, useEffect, useState } from "react";
import { ClipboardList, HeartPulse, History, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/hospital/auth";
import { formatDate, historyCategoryLabel } from "@/lib/hospital/fields";
import type { Option } from "@/lib/hospital/lookups";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type HistoryRow = { id: string; category: string; title: string; details: string | null; status: string; created_at: string };
type VitalRow = {
  id: string; recorded_at: string; blood_pressure: string | null; pulse: number | null;
  temperature_c: unknown; spo2: number | null; weight_kg: unknown; height_cm: unknown; notes: string | null;
};
type NoteRow = {
  id: string; visit_date: string; diagnosis: string; treatment_plan: string | null;
  doctor_notes: string | null; follow_up_date: string | null; follow_up_notes: string | null; created_at: string;
  appointments: { appointment_date: string; appointment_time: string } | null;
};

const today = () => new Date().toISOString().slice(0, 10);
const CATEGORY_LABELS = ["allergy", "chronic", "surgery", "family", "medication", "immunisation"];

/** Doctor-facing electronic medical record console for one patient at a time. */
export function EmrConsole({ doctorId, patients }: { doctorId: string; patients: Option[] }) {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState("");
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [vitals, setVitals] = useState<VitalRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [visits, setVisits] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [noteForm, setNoteForm] = useState({ visit_date: today(), diagnosis: "", treatment_plan: "", doctor_notes: "", follow_up_date: "", follow_up_notes: "", appointment_id: "" });
  const [vitalForm, setVitalForm] = useState({ blood_pressure: "", pulse: "", temperature_c: "", spo2: "", weight_kg: "", height_cm: "", notes: "" });
  const [historyForm, setHistoryForm] = useState({ category: "allergy", title: "", details: "" });

  const load = useCallback(async (pid: string) => {
    if (!pid) { setHistory([]); setVitals([]); setNotes([]); setVisits([]); return; }
    setLoading(true);
    const [h, v, n, a] = await Promise.all([
      supabase.from("patient_history").select("*").eq("patient_id", pid).order("created_at", { ascending: false }),
      supabase.from("vitals").select("*").eq("patient_id", pid).order("recorded_at", { ascending: false }),
      supabase.from("clinical_notes").select("*, appointments:appointment_id (appointment_date, appointment_time)")
        .eq("patient_id", pid).order("visit_date", { ascending: false }),
      supabase.from("appointments").select("id, appointment_date, appointment_time").eq("doctor_id", doctorId)
        .eq("patient_record_id", pid).order("appointment_date", { ascending: false }),
    ]);
    setLoading(false);
    if (h.error || v.error || n.error || a.error) { toast.error(h.error?.message ?? v.error?.message ?? n.error?.message ?? a.error?.message); return; }
    setHistory((h.data as unknown as HistoryRow[]) ?? []);
    setVitals((v.data as unknown as VitalRow[]) ?? []);
    setNotes((n.data as unknown as NoteRow[]) ?? []);
    setVisits(((a.data as unknown as { id: string; appointment_date: string; appointment_time: string }[]) ?? [])
      .map((r) => ({ id: r.id, label: `${formatDate(r.appointment_date)} at ${r.appointment_time}` })));
  }, [doctorId]);

  useEffect(() => { void load(patientId); }, [patientId, load]);

  const saveNote = async () => {
    if (!patientId || !noteForm.diagnosis.trim()) { toast.error("Select a patient and write a diagnosis."); return; }
    setBusy(true);
    const { error } = await supabase.from("clinical_notes").insert({
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: noteForm.appointment_id || null,
      visit_date: noteForm.visit_date || today(),
      diagnosis: noteForm.diagnosis.trim(),
      treatment_plan: noteForm.treatment_plan.trim() || null,
      doctor_notes: noteForm.doctor_notes.trim() || null,
      follow_up_date: noteForm.follow_up_date || null,
      follow_up_notes: noteForm.follow_up_notes.trim() || null,
      created_by: user?.id ?? null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Consultation note saved to the medical record.");
    setNoteForm({ visit_date: today(), diagnosis: "", treatment_plan: "", doctor_notes: "", follow_up_date: "", follow_up_notes: "", appointment_id: "" });
    void load(patientId);
  };

  const saveVitals = async () => {
    if (!patientId) { toast.error("Select a patient first."); return; }
    setBusy(true);
    const { error } = await supabase.from("vitals").insert({
      patient_id: patientId,
      recorded_by: user?.id ?? null,
      blood_pressure: vitalForm.blood_pressure.trim() || null,
      pulse: vitalForm.pulse ? Number(vitalForm.pulse) : null,
      temperature_c: vitalForm.temperature_c ? Number(vitalForm.temperature_c) : null,
      spo2: vitalForm.spo2 ? Number(vitalForm.spo2) : null,
      weight_kg: vitalForm.weight_kg ? Number(vitalForm.weight_kg) : null,
      height_cm: vitalForm.height_cm ? Number(vitalForm.height_cm) : null,
      notes: vitalForm.notes.trim() || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Vitals recorded.");
    setVitalForm({ blood_pressure: "", pulse: "", temperature_c: "", spo2: "", weight_kg: "", height_cm: "", notes: "" });
    void load(patientId);
  };

  const saveHistory = async () => {
    if (!patientId || !historyForm.title.trim()) { toast.error("Select a patient and give the entry a title."); return; }
    setBusy(true);
    const { error } = await supabase.from("patient_history").insert({
      patient_id: patientId,
      recorded_by: user?.id ?? null,
      category: historyForm.category,
      title: historyForm.title.trim(),
      details: historyForm.details.trim() || null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("History entry added.");
    setHistoryForm({ category: historyForm.category, title: "", details: "" });
    void load(patientId);
  };

  return (
    <Card className="rounded-3xl border-border/60 p-4 shadow-card sm:p-6">
      <h2 className="text-lg font-semibold">Patient medical records</h2>
      <p className="text-sm text-muted-foreground">Consultation notes, vitals and medical history — written by you, visible to the patient instantly.</p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <Label>Select patient</Label>
          <Select value={patientId} onValueChange={setPatientId}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="Choose a patient…" /></SelectTrigger>
            <SelectContent>
              {patients.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {patientId && (
          <Button variant="ghost" size="icon" aria-label="Refresh records" onClick={() => void load(patientId)}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!patientId ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
          Pick a patient to open their record.
        </div>
      ) : loading ? (
        <div className="mt-6 text-sm text-muted-foreground">Loading record…</div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-border/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4" /> Record consultation note</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><Label>Visit date</Label><Input className="mt-2" type="date" value={noteForm.visit_date} onChange={(e) => setNoteForm((s) => ({ ...s, visit_date: e.target.value }))} /></div>
              <div>
                <Label>Linked appointment</Label>
                <Select value={noteForm.appointment_id} onValueChange={(v) => setNoteForm((s) => ({ ...s, appointment_id: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder={visits.length ? "Optional" : "None for this patient"} /></SelectTrigger>
                  <SelectContent>{visits.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label>Diagnosis *</Label><Input className="mt-2" value={noteForm.diagnosis} onChange={(e) => setNoteForm((s) => ({ ...s, diagnosis: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label>Treatment plan</Label><Textarea className="mt-2" rows={2} value={noteForm.treatment_plan} onChange={(e) => setNoteForm((s) => ({ ...s, treatment_plan: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label>Doctor notes</Label><Textarea className="mt-2" rows={2} value={noteForm.doctor_notes} onChange={(e) => setNoteForm((s) => ({ ...s, doctor_notes: e.target.value }))} /></div>
              <div><Label>Follow-up date</Label><Input className="mt-2" type="date" value={noteForm.follow_up_date} onChange={(e) => setNoteForm((s) => ({ ...s, follow_up_date: e.target.value }))} /></div>
              <div><Label>Follow-up notes</Label><Input className="mt-2" value={noteForm.follow_up_notes} onChange={(e) => setNoteForm((s) => ({ ...s, follow_up_notes: e.target.value }))} /></div>
            </div>
            <Button className="mt-4 rounded-full" disabled={busy} onClick={() => void saveNote()}>Save note</Button>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><HeartPulse className="h-4 w-4" /> Record vitals</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><Label>Blood pressure</Label><Input className="mt-2" placeholder="120/80" value={vitalForm.blood_pressure} onChange={(e) => setVitalForm((s) => ({ ...s, blood_pressure: e.target.value }))} /></div>
              <div><Label>Pulse</Label><Input className="mt-2" type="number" value={vitalForm.pulse} onChange={(e) => setVitalForm((s) => ({ ...s, pulse: e.target.value }))} /></div>
              <div><Label>Temperature (°C)</Label><Input className="mt-2" type="number" step="0.1" value={vitalForm.temperature_c} onChange={(e) => setVitalForm((s) => ({ ...s, temperature_c: e.target.value }))} /></div>
              <div><Label>SpO₂ (%)</Label><Input className="mt-2" type="number" value={vitalForm.spo2} onChange={(e) => setVitalForm((s) => ({ ...s, spo2: e.target.value }))} /></div>
              <div><Label>Weight (kg)</Label><Input className="mt-2" type="number" step="0.1" value={vitalForm.weight_kg} onChange={(e) => setVitalForm((s) => ({ ...s, weight_kg: e.target.value }))} /></div>
              <div><Label>Height (cm)</Label><Input className="mt-2" type="number" step="0.1" value={vitalForm.height_cm} onChange={(e) => setVitalForm((s) => ({ ...s, height_cm: e.target.value }))} /></div>
              <div className="sm:col-span-2"><Label>Notes</Label><Input className="mt-2" value={vitalForm.notes} onChange={(e) => setVitalForm((s) => ({ ...s, notes: e.target.value }))} /></div>
            </div>
            <Button className="mt-4 rounded-full" disabled={busy} onClick={() => void saveVitals()}>Save vitals</Button>
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" /> Medical history &amp; allergies</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div>
                <Label>Category</Label>
                <Select value={historyForm.category} onValueChange={(v) => setHistoryForm((s) => ({ ...s, category: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORY_LABELS.map((c) => <SelectItem key={c} value={c}>{historyCategoryLabel(c)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Title</Label><Input className="mt-2" placeholder="Penicillin allergy" value={historyForm.title} onChange={(e) => setHistoryForm((s) => ({ ...s, title: e.target.value }))} /></div>
              <div className="sm:col-span-3"><Label>Details</Label><Input className="mt-2" value={historyForm.details} onChange={(e) => setHistoryForm((s) => ({ ...s, details: e.target.value }))} /></div>
            </div>
            <Button className="mt-4 rounded-full" disabled={busy} onClick={() => void saveHistory()}>Add entry</Button>
            {history.length > 0 && (
              <ul className="mt-4 divide-y divide-border/60">
                {history.map((h) => (
                  <li key={h.id} className="flex items-start justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{h.title} <span className="text-xs font-normal text-muted-foreground">· {historyCategoryLabel(h.category)}</span></div>
                      {h.details && <div className="text-xs text-muted-foreground">{h.details}</div>}
                    </div>
                    <Badge variant={h.status === "active" ? "default" : "outline"}>{h.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><ClipboardList className="h-4 w-4" /> Past consultations</h3>
            {notes.length === 0 ? (
              <div className="mt-4 text-sm text-muted-foreground">No consultation notes yet.</div>
            ) : (
              <ul className="mt-4 divide-y divide-border/60">
                {notes.map((n) => (
                  <li key={n.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold">{n.diagnosis}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(n.visit_date)}{n.appointments ? ` · ${formatDate(n.appointments.appointment_date)} ${n.appointments.appointment_time}` : ""}</div>
                    </div>
                    {n.treatment_plan && <div className="mt-1 text-xs text-muted-foreground">Treatment: {n.treatment_plan}</div>}
                    {n.doctor_notes && <div className="mt-1 text-xs text-muted-foreground">Notes: {n.doctor_notes}</div>}
                    {n.follow_up_date && (
                      <div className="mt-1 text-xs font-medium text-primary">Follow-up on {formatDate(n.follow_up_date)}{n.follow_up_notes ? ` — ${n.follow_up_notes}` : ""}</div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {vitals.length > 0 && (
            <div className="rounded-2xl border border-border/60 p-4 xl:col-span-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold"><HeartPulse className="h-4 w-4" /> Vitals timeline</h3>
              <div className="-mx-4 mt-4 overflow-x-auto sm:mx-0">
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
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
