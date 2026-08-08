import { createFileRoute } from "@tanstack/react-router";
import { Activity, Ambulance, BedDouble, Building2, IndianRupee, Home, Mail, Pill, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { CrudManager } from "@/components/hms/CrudManager";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { labelFor, useLookup } from "@/lib/hospital/lookups";
import { AppointmentQueue } from "@/components/hms/AppointmentQueue";
import {
  admissionFields, ambulanceFields, appointmentFields, auditFields, billingFields,
  contactFields, departmentFields, doctorFields, inr, medicineFields, patientFields, reportFields, staffFields,
} from "@/lib/hospital/fields";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — LifeCare Hospital" },
      { name: "description", content: "Manage patients, doctors, staff, admissions, pharmacy, billing and ambulances." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDash,
});

const TABS = [
  ["overview", "Overview"], ["patients", "Patients"], ["doctors", "Doctors"], ["departments", "Departments"],
  ["staff", "Staff"], ["appointments", "Appointments"], ["admissions", "Admissions"], ["prescriptions", "Prescriptions"],
  ["pharmacy", "Pharmacy"], ["billing", "Billing"], ["reports", "Reports"], ["ambulance", "Ambulance"], ["enquiries", "Enquiries"], ["audit", "Audit log"],
] as const;

function useCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const tables = ["patients", "doctors", "appointments", "admissions", "billing", "medicines", "staff", "ambulance", "contacts"] as const;
    void Promise.all(
      tables.map(async (t) => {
        const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
        return [t, count ?? 0] as const;
      }),
    ).then((pairs) => setCounts(Object.fromEntries(pairs)));
  }, []);
  return counts;
}

function useRevenue() {
  const [state, setState] = useState({ revenue: 0, today: 0, pending: 0 });
  useEffect(() => {
    const iso = new Date().toISOString().slice(0, 10);
    void supabase.from("billing").select("total_amount, payment_status").then(({ data }) => {
      const revenue = (data ?? []).filter((b) => b.payment_status === "paid").reduce((s, b) => s + Number(b.total_amount ?? 0), 0);
      setState((p) => ({ ...p, revenue }));
    });
    void supabase.from("appointments").select("appointment_date, status").then(({ data }) => {
      const rows = data ?? [];
      setState((p) => ({
        ...p,
        today: rows.filter((r) => r.appointment_date === iso).length,
        pending: rows.filter((r) => r.status === "pending").length,
      }));
    });
  }, []);
  return state;
}

function AdminDash() {
  const counts = useCounts();
  const money = useRevenue();
  const departments = useLookup("departments", "department_name");
  const doctors = useLookup("doctors", "name");
  const patients = useLookup("patients", "full_name");

  return (
    <DashboardLayout
      title="Admin console"
      allowedRoles={["admin"]}
      nav={[
        { to: "/dashboard/admin", label: "Console", icon: <Home className="h-4 w-4" /> },
        { to: "/departments", label: "Departments site", icon: <Building2 className="h-4 w-4" /> },
        { to: "/doctors", label: "Doctors site", icon: <Stethoscope className="h-4 w-4" /> },
        { to: "/appointment", label: "Booking page", icon: <Activity className="h-4 w-4" /> },
      ]}
    >
      <h1 className="font-display text-4xl">Hospital overview.</h1>
      <p className="mt-2 text-muted-foreground">Full control across every module of LifeCare Hospital.</p>

      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {TABS.map(([v, l]) => <TabsTrigger key={v} value={v}>{l}</TabsTrigger>)}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Patients", value: counts["patients"], icon: <Users className="h-4 w-4" /> },
              { label: "Doctors", value: counts["doctors"], icon: <Stethoscope className="h-4 w-4" /> },
              { label: "Appointments", value: counts["appointments"], icon: <Activity className="h-4 w-4" /> },
              { label: "Admitted", value: counts["admissions"], icon: <BedDouble className="h-4 w-4" /> },
              { label: "Bills raised", value: counts["billing"], icon: <IndianRupee className="h-4 w-4" /> },
              { label: "Medicines", value: counts["medicines"], icon: <Pill className="h-4 w-4" /> },
              { label: "Staff", value: counts["staff"], icon: <ShieldCheck className="h-4 w-4" /> },
              { label: "Ambulances", value: counts["ambulance"], icon: <Ambulance className="h-4 w-4" /> },
            ].map((s) => (
              <Card key={s.label} className="rounded-3xl border-border/60 p-6 shadow-card">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">{s.icon}{s.label}</div>
                <div className="mt-3 font-display text-4xl">{s.value ?? "—"}</div>
              </Card>
            ))}
            {[
              { label: "Total revenue", value: inr(money.revenue) },
              { label: "Appointments today", value: String(money.today) },
              { label: "Pending approvals", value: String(money.pending) },
              { label: "Departments", value: String(departments.length) },
            ].map((s) => (
              <Card key={s.label} className="rounded-3xl border-border/60 bg-accent/30 p-6 shadow-card">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="mt-3 font-display text-4xl">{s.value}</div>
              </Card>
            ))}
          </div>
          <div className="mt-6 space-y-6">
            <AppointmentQueue title="Pending approvals" description="Approve, reject or reschedule requests from patients."
              statuses={["pending"]} actions={["approve", "reject", "reschedule"]}
              patientLabels={Object.fromEntries(patients.map((p) => [p.value, p.label]))} />
            <CrudManager table="appointments" title="Latest appointments" description="Most recent bookings across all departments."
              orderBy={{ column: "created_at", ascending: false }} canCreate={false}
              fields={appointmentFields(doctors, departments, patients)} searchKeys={["doctor_name", "department", "status"]} />
            <CrudManager table="audit_logs" title="Recent activity" description="The latest changes across the hospital."
              canCreate={false} canEdit={false} canDelete={false} fields={auditFields} searchKeys={["action", "table_name"]}
              emptyLabel="No activity recorded yet." />
          </div>
        </TabsContent>

        <TabsContent value="patients" className="mt-6">
          <CrudManager table="patients" title="Patients" description="Patient master records (UHID is generated automatically)."
            fields={patientFields} searchKeys={["full_name", "uhid", "mobile", "city"]} />
        </TabsContent>

        <TabsContent value="doctors" className="mt-6">
          <CrudManager table="doctors" title="Doctors" description="Consultants and their department, fees and availability."
            orderBy={{ column: "name", ascending: true }} fields={doctorFields(departments)} searchKeys={["name", "specialization"]} />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <CrudManager table="departments" title="Departments" orderBy={{ column: "department_name", ascending: true }}
            fields={departmentFields} searchKeys={["department_name", "slug"]} />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <CrudManager table="staff" title="Staff" description="Nurses, technicians, receptionists and support staff."
            fields={staffFields(departments)} searchKeys={["name", "designation", "phone"]} />
        </TabsContent>

        <TabsContent value="appointments" className="mt-6">
          <CrudManager table="appointments" title="Appointments" fields={appointmentFields(doctors, departments, patients)}
            searchKeys={["doctor_name", "department", "status"]} />
        </TabsContent>

        <TabsContent value="admissions" className="mt-6">
          <CrudManager table="admissions" title="Admissions" description="Inpatient beds, wards and discharge status."
            fields={admissionFields(patients)} searchKeys={["room_number", "ward", "status"]} />
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-6">
          <CrudManager table="prescriptions" title="Prescriptions" fields={[
            { key: "patient_id", label: "Patient", type: "select", options: patients, required: true, render: (r) => labelFor(patients, r["patient_id"]) },
            { key: "doctor_id", label: "Doctor", type: "select", options: doctors, render: (r) => labelFor(doctors, r["doctor_id"]) },
            { key: "notes", label: "Notes", type: "textarea" },
            { key: "created_at", label: "Issued", readOnly: true },
          ]} />
        </TabsContent>

        <TabsContent value="pharmacy" className="mt-6">
          <CrudManager table="medicines" title="Pharmacy stock" orderBy={{ column: "medicine_name", ascending: true }}
            fields={medicineFields} searchKeys={["medicine_name", "manufacturer"]} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <CrudManager table="billing" title="Billing" description="Bill numbers and totals are calculated automatically."
            fields={billingFields(patients)} searchKeys={["bill_number", "payment_status"]} />
        </TabsContent>

        <TabsContent value="ambulance" className="mt-6">
          <CrudManager table="ambulance" title="Ambulance fleet" orderBy={{ column: "vehicle_number", ascending: true }}
            fields={ambulanceFields} searchKeys={["vehicle_number", "driver_name", "status"]} />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <CrudManager table="reports" title="Patient reports" description="Lab, radiology and discharge reports; patients are notified when added."
            fields={reportFields(patients, doctors)} searchKeys={["title", "report_type", "status"]} />
        </TabsContent>

        <TabsContent value="ambulance-legacy" className="mt-6">
          <CrudManager table="ambulance" title="Ambulance fleet" orderBy={{ column: "vehicle_number", ascending: true }}
            fields={ambulanceFields} searchKeys={["vehicle_number", "driver_name", "status"]} />
        </TabsContent>

        <TabsContent value="enquiries" className="mt-6">
          <CrudManager table="contacts" title="Website enquiries" description="Messages submitted from the public contact form."
            canCreate={false} fields={contactFields} searchKeys={["name", "email", "subject"]} />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <CrudManager table="audit_logs" title="Audit log" description="Every create, update and delete across core records."
            canCreate={false} canEdit={false} canDelete={false} fields={auditFields} searchKeys={["action", "table_name"]}
            emptyLabel="No activity recorded yet." />
        </TabsContent>
      </Tabs>

      <p className="mt-8 flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> All changes are audited and protected by role-based access rules.</p>
    </DashboardLayout>
  );
}