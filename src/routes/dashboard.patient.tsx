import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CreditCard, Download, FileText, Home, Pill, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { AppointmentQueue } from "@/components/hms/AppointmentQueue";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/hospital/auth";
import { formatDate, inr } from "@/lib/hospital/fields";
import { exportPdf } from "@/lib/hospital/export";

export const Route = createFileRoute("/dashboard/patient")({
  head: () => ({
    meta: [
      { title: "Patient portal — LifeCare Hospital" },
      { name: "description", content: "Appointments, prescriptions, reports and bills for LifeCare patients." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PatientDash,
});

type PatientRow = {
  id: string; uhid: string; full_name: string; gender: string | null; date_of_birth: string | null;
  blood_group: string | null; mobile: string; email: string | null; address: string | null;
  city: string | null; state: string | null; pin_code: string | null; emergency_contact: string | null;
};
type Bill = { id: string; bill_number: string; total_amount: number | null; payment_status: string; payment_method: string | null; bill_date: string; consultation_fee: number; medicine_cost: number; room_charges: number; laboratory_charges: number; other_charges: number };
type Report = { id: string; title: string; report_type: string; status: string; file_url: string | null; notes: string | null; created_at: string };
type Prescription = { id: string; notes: string | null; medicines: unknown; created_at: string };

function PatientDash() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<PatientRow | null>(null);
  const [bills, setBills] = useState<Bill[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [scripts, setScripts] = useState<Prescription[]>([]);
  const [apptCount, setApptCount] = useState(0);

  const loadRecords = useCallback(async (patientId: string) => {
    const [b, r, p] = await Promise.all([
      supabase.from("billing").select("*").eq("patient_id", patientId).order("bill_date", { ascending: false }),
      supabase.from("reports").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
      supabase.from("prescriptions").select("*").eq("patient_id", patientId).order("created_at", { ascending: false }),
    ]);
    setBills((b.data as unknown as Bill[]) ?? []);
    setReports((r.data as unknown as Report[]) ?? []);
    setScripts((p.data as unknown as Prescription[]) ?? []);
  }, []);

  useEffect(() => {
    if (!user) return;
    void supabase.from("patients").select("*").eq("user_id", user.id).limit(1).maybeSingle().then(({ data }) => {
      const row = (data as PatientRow | null) ?? null;
      setPatient(row);
      if (row) void loadRecords(row.id);
    });
    void supabase.from("appointments").select("status").eq("patient_id", user.id).then(({ data }) => {
      setApptCount((data ?? []).filter((a) => a.status === "pending" || a.status === "confirmed").length);
    });
  }, [user, loadRecords]);

  const due = bills.filter((b) => b.payment_status !== "paid").reduce((s, b) => s + Number(b.total_amount ?? 0), 0);

  const pay = async (bill: Bill, method: string) => {
    const { error } = await supabase.rpc("pay_bill", { _bill_id: bill.id, _method: method });
    if (error) { toast.error(error.message); return; }
    toast.success(`Bill ${bill.bill_number} paid.`);
    if (patient) void loadRecords(patient.id);
  };

  return (
    <DashboardLayout
      title="Patient portal"
      allowedRoles={["patient"]}
      nav={[
        { to: "/dashboard/patient", label: "Overview", icon: <Home className="h-4 w-4" /> },
        { to: "/appointment", label: "Book appointment", icon: <Calendar className="h-4 w-4" /> },
        { to: "/doctors", label: "Find a doctor", icon: <User className="h-4 w-4" /> },
      ]}
    >
      <h1 className="font-display text-4xl">Welcome{patient ? `, ${patient.full_name.split(" ")[0]}` : ""}.</h1>
      <p className="mt-2 text-muted-foreground">{patient ? `UHID ${patient.uhid}` : "Complete your profile to link your hospital record."}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active appointments", value: String(apptCount) },
          { label: "Prescriptions", value: String(scripts.length) },
          { label: "Outstanding bills", value: inr(due) },
          { label: "Reports available", value: String(reports.length) },
        ].map((s) => (
          <Card key={s.label} className="rounded-3xl border-border/60 p-6 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className="mt-3 font-display text-4xl">{s.value}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="appointments" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-6 space-y-4">
          <div className="flex justify-end">
            <Link to="/appointment"><Button size="sm" className="rounded-full">Book new appointment</Button></Link>
          </div>
          {user && (
            <AppointmentQueue title="My appointments" description="Track status, reschedule or cancel a visit."
              patientUserId={user.id} actions={["reschedule", "cancel"]} />
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <Card className="rounded-3xl border-border/60 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Prescriptions</h2>
            {scripts.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">No prescriptions issued yet.</div>
            ) : (
              <div className="mt-4 divide-y divide-border/60">
                {scripts.map((s) => {
                  const meds = Array.isArray(s.medicines) ? (s.medicines as { name?: string; dosage?: string; duration?: string }[]) : [];
                  return (
                    <div key={s.id} className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="text-sm font-semibold">Issued {formatDate(s.created_at)}</div>
                        <Button size="sm" variant="outline" className="rounded-full"
                          onClick={() => exportPdf("Prescription", [{ key: "name", label: "Medicine" }, { key: "dosage", label: "Dosage" }, { key: "duration", label: "Duration" }], meds as unknown as Record<string, unknown>[])}>
                          <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {meds.map((m, i) => <li key={i}><Pill className="mr-1 inline h-3 w-3" />{m.name} · {m.dosage} · {m.duration}</li>)}
                      </ul>
                      {s.notes && <p className="mt-2 text-xs text-muted-foreground/80">{s.notes}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card className="rounded-3xl border-border/60 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Reports</h2>
            {reports.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">No reports uploaded yet.</div>
            ) : (
              <div className="mt-4 divide-y divide-border/60">
                {reports.map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <div className="text-sm font-semibold"><FileText className="mr-1 inline h-3 w-3" />{r.title}</div>
                      <div className="text-xs text-muted-foreground">{r.report_type} · {formatDate(r.created_at)}</div>
                      {r.notes && <div className="mt-1 max-w-xl text-xs text-muted-foreground/80">{r.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.status === "ready" ? "secondary" : "default"}>{r.status}</Badge>
                      {r.file_url ? (
                        <a href={r.file_url} target="_blank" rel="noreferrer">
                          <Button size="sm" variant="outline" className="rounded-full"><Download className="mr-1 h-3 w-3" /> Open</Button>
                        </a>
                      ) : (
                        <Button size="sm" variant="outline" className="rounded-full"
                          onClick={() => exportPdf(r.title, [{ key: "title", label: "Report" }, { key: "report_type", label: "Type" }, { key: "notes", label: "Findings" }], [r as unknown as Record<string, unknown>])}>
                          <Download className="mr-1 h-3 w-3" /> Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <Card className="rounded-3xl border-border/60 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Bills</h2>
            {bills.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">No bills raised yet.</div>
            ) : (
              <div className="mt-4 divide-y divide-border/60">
                {bills.map((b) => (
                  <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                    <div>
                      <div className="text-sm font-semibold">{b.bill_number} · {inr(b.total_amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(b.bill_date)} · Consultation {inr(b.consultation_fee)} · Pharmacy {inr(b.medicine_cost)} · Room {inr(b.room_charges)} · Lab {inr(b.laboratory_charges)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={b.payment_status === "paid" ? "secondary" : "default"}>{b.payment_status}</Badge>
                      <Button size="sm" variant="outline" className="rounded-full"
                        onClick={() => exportPdf(`Bill ${b.bill_number}`, [
                          { key: "bill_number", label: "Bill no." }, { key: "bill_date", label: "Date" },
                          { key: "consultation_fee", label: "Consultation" }, { key: "medicine_cost", label: "Pharmacy" },
                          { key: "room_charges", label: "Room" }, { key: "laboratory_charges", label: "Laboratory" },
                          { key: "other_charges", label: "Other" }, { key: "total_amount", label: "Total" },
                          { key: "payment_status", label: "Status" },
                        ], [b as unknown as Record<string, unknown>])}>
                        <Download className="mr-1 h-3 w-3" /> Invoice
                      </Button>
                      {b.payment_status !== "paid" && (
                        <Select onValueChange={(v) => void pay(b, v)}>
                          <SelectTrigger className="h-8 w-36 rounded-full"><CreditCard className="mr-1 h-3 w-3" /><SelectValue placeholder="Pay now" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upi">Pay by UPI</SelectItem>
                            <SelectItem value="card">Pay by card</SelectItem>
                            <SelectItem value="cash">Pay at counter</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <PatientProfile patient={patient} onSaved={(p) => { setPatient(p); void loadRecords(p.id); }} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

const blank = {
  full_name: "", gender: "", date_of_birth: "", blood_group: "", mobile: "", email: "",
  address: "", city: "", state: "", pin_code: "", emergency_contact: "",
};

function PatientProfile({ patient, onSaved }: { patient: PatientRow | null; onSaved: (p: PatientRow) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState<Record<string, string>>(blank);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!patient) return;
    setForm(Object.fromEntries(Object.keys(blank).map((k) => [k, String((patient as unknown as Record<string, unknown>)[k] ?? "")])));
  }, [patient]);

  const save = async () => {
    if (!user) return;
    if (!form["full_name"]?.trim() || !form["mobile"]?.trim()) { toast.error("Name and mobile are required."); return; }
    const payload = {
      ...form,
      full_name: form["full_name"]!.trim(),
      mobile: form["mobile"]!.trim(),
      date_of_birth: form["date_of_birth"] || null,
      user_id: user.id,
    };
    setSaving(true);
    const res = patient
      ? await supabase.from("patients").update(payload).eq("id", patient.id).select("*").maybeSingle()
      : await supabase.from("patients").insert(payload).select("*").maybeSingle();
    setSaving(false);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Profile saved.");
    if (res.data) onSaved(res.data as unknown as PatientRow);
  };

  const text = (key: string, label: string, type = "text") => (
    <div>
      <Label htmlFor={`pp-${key}`}>{label}</Label>
      <Input id={`pp-${key}`} className="mt-2" type={type} value={form[key] ?? ""} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
    </div>
  );

  return (
    <Card className="rounded-3xl border-border/60 p-6 shadow-card">
      <h2 className="text-lg font-semibold">My details</h2>
      <p className="text-sm text-muted-foreground">{patient ? `UHID ${patient.uhid}` : "Saving this creates your hospital record and UHID."}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {text("full_name", "Full name")}
        {text("mobile", "Mobile")}
        {text("email", "Email", "email")}
        {text("date_of_birth", "Date of birth", "date")}
        <div>
          <Label>Gender</Label>
          <Select value={form["gender"] ?? ""} onValueChange={(v) => setForm((s) => ({ ...s, gender: v }))}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>{["male", "female", "other"].map((g) => <SelectItem key={g} value={g}>{g[0]!.toUpperCase() + g.slice(1)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Blood group</Label>
          <Select value={form["blood_group"] ?? ""} onValueChange={(v) => setForm((s) => ({ ...s, blood_group: v }))}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="Select…" /></SelectTrigger>
            <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {text("city", "City")}
        {text("state", "State")}
        {text("pin_code", "PIN code")}
        {text("emergency_contact", "Emergency contact")}
        <div className="sm:col-span-2">
          <Label htmlFor="pp-address">Address</Label>
          <Textarea id="pp-address" className="mt-2" maxLength={500} value={form["address"] ?? ""} onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
        </div>
      </div>
      <Button className="mt-6 rounded-full" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save profile"}</Button>
    </Card>
  );
}
