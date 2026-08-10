import { createFileRoute } from "@tanstack/react-router";
import { Activity, CalendarCheck, FileText, Home, Pill, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { AppointmentQueue } from "@/components/hms/AppointmentQueue";
import { CrudManager } from "@/components/hms/CrudManager";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/hospital/auth";
import { useLookup } from "@/lib/hospital/lookups";
import { prescriptionFields, reportFields, inr } from "@/lib/hospital/fields";

export const Route = createFileRoute("/dashboard/doctor")({
  head: () => ({
    meta: [
      { title: "Doctor portal — LifeCare Hospital" },
      { name: "description", content: "Consults, prescriptions, reports and patient history for LifeCare consultants." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DoctorDash,
});

type DoctorRow = {
  id: string; name: string; specialization: string; qualification: string | null; experience: number;
  consultation_fee: number; phone: string | null; email: string | null; availability: string | null;
  languages: string | null; bio: string | null;
};

function DoctorDash() {
  const { user } = useAuth();
  const patients = useLookup("patients", "full_name");
  const doctorsLookup = useLookup("doctors", "name");
  const [doctor, setDoctor] = useState<DoctorRow | null>(null);
  const [ready, setReady] = useState(false);
  const [stats, setStats] = useState({ today: 0, upcoming: 0, total: 0, pending: 0, confirmed: 0, completed: 0, patients: 0 });

  useEffect(() => {
    if (!user) return;
    void supabase.from("doctors").select("*").eq("user_id", user.id).limit(1).maybeSingle().then(({ data }) => {
      setDoctor((data as DoctorRow | null) ?? null);
      setReady(true);
    });
  }, [user]);

  useEffect(() => {
    if (!doctor) return;
    const iso = new Date().toISOString().slice(0, 10);
    void supabase.from("appointments").select("appointment_date, status, patient_record_id").eq("doctor_id", doctor.id).then(({ data }) => {
      const rows = data ?? [];
      setStats({
        today: rows.filter((r) => r.appointment_date === iso).length,
        upcoming: rows.filter((r) => r.appointment_date > iso && r.status !== "cancelled").length,
        total: rows.length,
        pending: rows.filter((r) => r.status === "pending").length,
        confirmed: rows.filter((r) => r.status === "confirmed").length,
        completed: rows.filter((r) => r.status === "completed").length,
        patients: new Set(rows.map((r) => r.patient_record_id).filter(Boolean)).size,
      });
    });
  }, [doctor]);

  return (
    <DashboardLayout
      title="Doctor portal"
      allowedRoles={["doctor"]}
      nav={[
        { to: "/dashboard/doctor", label: "Overview", icon: <Home className="h-4 w-4" /> },
        { to: "/doctors", label: "Doctors site", icon: <Users className="h-4 w-4" /> },
        { to: "/appointment", label: "Booking page", icon: <CalendarCheck className="h-4 w-4" /> },
      ]}
    >
      <h1 className="font-display text-4xl">{doctor ? `Good day, ${doctor.name}.` : "Doctor portal."}</h1>
      <p className="mt-2 text-muted-foreground">
        {doctor ? `${doctor.specialization} · Consultation ${inr(doctor.consultation_fee)}` : "Your consultant profile is not linked yet."}
      </p>

      {ready && !doctor && (
        <Card className="mt-8 rounded-3xl border-border/60 p-6 shadow-card">
          <p className="text-sm text-muted-foreground">
            No consultant record is linked to this account yet. Ask an administrator to set your account on a doctor profile in the admin console.
          </p>
        </Card>
      )}

      {doctor && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Today's consults", value: stats.today, icon: <CalendarCheck className="h-4 w-4" /> },
              { label: "Upcoming", value: stats.upcoming, icon: <CalendarCheck className="h-4 w-4" /> },
              { label: "Total appointments", value: stats.total, icon: <Activity className="h-4 w-4" /> },
              { label: "Awaiting approval", value: stats.pending, icon: <Activity className="h-4 w-4" /> },
              { label: "Confirmed", value: stats.confirmed, icon: <CalendarCheck className="h-4 w-4" /> },
              { label: "Completed visits", value: stats.completed, icon: <FileText className="h-4 w-4" /> },
              { label: "Patients seen", value: stats.patients, icon: <Users className="h-4 w-4" /> },
            ].map((s) => (
              <Card key={s.label} className="rounded-3xl border-border/60 p-6 shadow-card">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">{s.icon}{s.label}</div>
                <div className="mt-3 font-display text-4xl">{s.value}</div>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="today" className="mt-8">
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="schedule">Full schedule</TabsTrigger>
              <TabsTrigger value="patients">My patients</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="profile">My profile</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-6 space-y-6">
              <AppointmentQueue title="Today's appointments" description="Approve, complete or cancel the consults booked for today."
                doctorId={doctor.id} todayOnly actions={["approve", "reject", "complete"]}
                patientLabels={Object.fromEntries(patients.map((p) => [p.value, p.label]))} />
              <AppointmentQueue title="Pending approvals" description="New requests waiting on you."
                doctorId={doctor.id} statuses={["pending"]} actions={["approve", "reject"]}
                patientLabels={Object.fromEntries(patients.map((p) => [p.value, p.label]))} />
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <AppointmentQueue title="My schedule" description="Every appointment assigned to you, newest first."
                doctorId={doctor.id} actions={["approve", "reject", "complete", "reschedule"]}
                patientLabels={Object.fromEntries(patients.map((p) => [p.value, p.label]))} />
            </TabsContent>

            <TabsContent value="patients" className="mt-6">
              <AppointmentQueue title="My patients" description="Patients with appointments assigned to you — open View for full details."
                doctorId={doctor.id} patientLabels={Object.fromEntries(patients.map((p) => [p.value, p.label]))} />
            </TabsContent>

            <TabsContent value="prescriptions" className="mt-6">
              <CrudManager table="prescriptions" title="Prescriptions" description="Written for your patients."
                filter={{ doctor_id: doctor.id }} defaults={{ doctor_id: doctor.id }}
                fields={prescriptionFields(patients, doctorsLookup)} searchKeys={["notes"]} />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <CrudManager table="reports" title="Patient reports" description="Upload a link to a lab or imaging report; the patient is notified instantly."
                filter={{ doctor_id: doctor.id }} defaults={{ doctor_id: doctor.id }}
                fields={reportFields(patients, doctorsLookup)} searchKeys={["title", "report_type", "status"]} />
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <DoctorProfile doctor={doctor} onSaved={setDoctor} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
}

function DoctorProfile({ doctor, onSaved }: { doctor: DoctorRow; onSaved: (d: DoctorRow) => void }) {
  const [form, setForm] = useState(doctor);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("doctors").update({
      specialization: form.specialization,
      qualification: form.qualification,
      experience: Number(form.experience) || 0,
      consultation_fee: Number(form.consultation_fee) || 0,
      phone: form.phone,
      availability: form.availability,
      languages: form.languages,
      bio: form.bio,
    }).eq("id", doctor.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated.");
    onSaved(form);
  };

  const field = (key: keyof DoctorRow, label: string, type = "text") => (
    <div>
      <Label htmlFor={`p-${key}`}>{label}</Label>
      <Input id={`p-${key}`} className="mt-2" type={type} value={String(form[key] ?? "")}
        onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
    </div>
  );

  return (
    <Card className="rounded-3xl border-border/60 p-6 shadow-card">
      <h2 className="text-lg font-semibold">My profile</h2>
      <p className="text-sm text-muted-foreground">Shown on your public profile page at LifeCare.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div><Label>Name</Label><Input className="mt-2" value={doctor.name} readOnly /></div>
        {field("specialization", "Specialization")}
        {field("qualification", "Qualification")}
        {field("experience", "Experience (years)", "number")}
        {field("consultation_fee", "Consultation fee (₹)", "number")}
        {field("phone", "Phone")}
        {field("availability", "Availability")}
        {field("languages", "Languages")}
        <div className="sm:col-span-2">
          <Label htmlFor="p-bio">Biography</Label>
          <Textarea id="p-bio" className="mt-2" maxLength={2000} value={form.bio ?? ""} onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))} />
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <Button className="rounded-full" disabled={saving} onClick={() => void save()}><Pill className="mr-1 h-4 w-4" />{saving ? "Saving…" : "Save profile"}</Button>
      </div>
    </Card>
  );
}
