import { createFileRoute } from "@tanstack/react-router";
import { Ambulance, BedDouble, CalendarCheck, Home, Mail, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { CrudManager } from "@/components/hms/CrudManager";
import { AppointmentQueue } from "@/components/hms/AppointmentQueue";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useLookup } from "@/lib/hospital/lookups";
import { admissionFields, ambulanceFields, appointmentFields, billingFields, contactFields, patientFields } from "@/lib/hospital/fields";

export const Route = createFileRoute("/dashboard/receptionist")({
  head: () => ({
    meta: [
      { title: "Reception desk — LifeCare Hospital" },
      { name: "description", content: "Register patients, schedule appointments, manage admissions and dispatch ambulances." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReceptionDash,
});

function ReceptionDash() {
  const departments = useLookup("departments", "department_name");
  const doctors = useLookup("doctors", "name");
  const patients = useLookup("patients", "full_name");
  const [today, setToday] = useState<number | null>(null);
  const [admitted, setAdmitted] = useState<number | null>(null);
  const [free, setFree] = useState<number | null>(null);
  const [pending, setPending] = useState<number | null>(null);

  useEffect(() => {
    const iso = new Date().toISOString().slice(0, 10);
    void supabase.from("appointments").select("*", { count: "exact", head: true }).eq("appointment_date", iso)
      .then(({ count }) => setToday(count ?? 0));
    void supabase.from("admissions").select("*", { count: "exact", head: true }).eq("status", "admitted")
      .then(({ count }) => setAdmitted(count ?? 0));
    void supabase.from("ambulance").select("*", { count: "exact", head: true }).eq("status", "available")
      .then(({ count }) => setFree(count ?? 0));
    void supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending")
      .then(({ count }) => setPending(count ?? 0));
  }, []);

  return (
    <DashboardLayout
      title="Reception desk"
      allowedRoles={["receptionist", "admin"]}
      nav={[
        { to: "/dashboard/receptionist", label: "Front desk", icon: <Home className="h-4 w-4" /> },
        { to: "/appointment", label: "Booking page", icon: <CalendarCheck className="h-4 w-4" /> },
        { to: "/doctors", label: "Doctors", icon: <Users className="h-4 w-4" /> },
      ]}
    >
      <h1 className="font-display text-4xl">Front desk.</h1>
      <p className="mt-2 text-muted-foreground">Register patients, schedule visits, and keep beds and ambulances up to date.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Appointments today", value: today, icon: <CalendarCheck className="h-4 w-4" /> },
          { label: "Awaiting approval", value: pending, icon: <CalendarCheck className="h-4 w-4" /> },
          { label: "Currently admitted", value: admitted, icon: <BedDouble className="h-4 w-4" /> },
          { label: "Ambulances free", value: free, icon: <Ambulance className="h-4 w-4" /> },
        ].map((s) => (
          <Card key={s.label} className="rounded-3xl border-border/60 p-6 shadow-card">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">{s.icon}{s.label}</div>
            <div className="mt-3 font-display text-4xl">{s.value ?? "—"}</div>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="approvals" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="admissions">Admissions</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="ambulance">Ambulance</TabsTrigger>
          <TabsTrigger value="enquiries">Enquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6 space-y-6">
          <AppointmentQueue title="Pending requests" description="Approve or reject appointments booked by patients."
            statuses={["pending"]} actions={["approve", "reject", "reschedule"]}
            patientLabels={Object.fromEntries(patients.map((p) => [p.value, p.label]))} />
          <AppointmentQueue title="Today at the desk" description="Everything scheduled for today."
            todayOnly actions={["approve", "complete", "cancel"]}
            patientLabels={Object.fromEntries(patients.map((p) => [p.value, p.label]))} />
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <CrudManager table="appointments" title="Appointments" description="Schedule, confirm or cancel visits."
            canDelete={false} fields={appointmentFields(doctors, departments, patients)} searchKeys={["doctor_name", "department", "status"]} />
        </TabsContent>
        <TabsContent value="patients" className="mt-6">
          <CrudManager table="patients" title="Patient registration" canDelete={false} fields={patientFields}
            searchKeys={["full_name", "uhid", "mobile"]} />
        </TabsContent>
        <TabsContent value="admissions" className="mt-6">
          <CrudManager table="admissions" title="Admissions" canDelete={false} fields={admissionFields(patients)}
            searchKeys={["room_number", "ward", "status"]} />
        </TabsContent>
        <TabsContent value="billing" className="mt-6">
          <CrudManager table="billing" title="Billing" description="Generate a bill — the patient is notified automatically."
            canDelete={false} fields={billingFields(patients)} searchKeys={["bill_number", "payment_status"]} />
        </TabsContent>
        <TabsContent value="ambulance" className="mt-6">
          <CrudManager table="ambulance" title="Ambulance fleet" canDelete={false} orderBy={{ column: "vehicle_number", ascending: true }}
            fields={ambulanceFields} searchKeys={["vehicle_number", "driver_name", "status"]} />
        </TabsContent>
        <TabsContent value="enquiries" className="mt-6">
          <CrudManager table="contacts" title="Website enquiries" canCreate={false} canDelete={false} fields={contactFields}
            searchKeys={["name", "email", "subject"]} />
        </TabsContent>
      </Tabs>

      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> Reception access excludes staff records and the audit log.</p>
    </DashboardLayout>
  );
}