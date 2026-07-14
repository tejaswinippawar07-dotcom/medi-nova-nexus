import { createFileRoute } from "@tanstack/react-router";
import { Activity, Ambulance, Building2, DollarSign, FlaskConical, Home, Pill, Settings, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DEPARTMENTS, DOCTORS } from "@/lib/hospital/data";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin dashboard — MediNova" }, { name: "robots", content: "noindex" }] }),
  component: AdminDash,
});

function AdminDash() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    supabase.from("appointments").select("*", { count: "exact", head: true }).then(({ count }) => setCount(count ?? 0));
  }, []);

  return (
    <DashboardLayout
      title="Admin console"
      requiredRole="admin"
      nav={[
        { to: "/dashboard/admin", label: "Overview", icon: <Home className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Doctors", icon: <Stethoscope className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Patients", icon: <Users className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Departments", icon: <Building2 className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Pharmacy", icon: <Pill className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Laboratory", icon: <FlaskConical className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Ambulance", icon: <Ambulance className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Billing", icon: <DollarSign className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Analytics", icon: <Activity className="h-4 w-4" /> },
        { to: "/dashboard/admin", label: "Settings", icon: <Settings className="h-4 w-4" /> },
      ]}
    >
      <div className="font-display text-4xl">Hospital overview.</div>
      <p className="mt-2 text-muted-foreground">Operational snapshot across departments.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Doctors", value: DOCTORS.length },
          { label: "Departments", value: DEPARTMENTS.length },
          { label: "Appointments", value: count ?? "—" },
          { label: "Revenue (mo)", value: "$482K" },
        ].map((s) => (
          <Card key={s.label} className="rounded-3xl border-border/60 p-6 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className="mt-3 font-display text-4xl">{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-border/60 p-6 shadow-card">
          <h2 className="text-lg font-semibold">Department load (today)</h2>
          <div className="mt-4 space-y-3">
            {DEPARTMENTS.slice(0, 6).map((d, i) => {
              const pct = 30 + ((i * 13) % 60);
              return (
                <div key={d.slug}>
                  <div className="flex items-center justify-between text-sm"><span>{d.name}</span><span className="text-muted-foreground">{pct}%</span></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="rounded-3xl border-border/60 p-6 shadow-card">
          <h2 className="text-lg font-semibold">Recent alerts</h2>
          <div className="mt-4 space-y-3">
            {[
              { title: "Low stock: Amoxicillin 500mg", tone: "default" },
              { title: "Ambulance A-04 due for service", tone: "secondary" },
              { title: "Lab: 3 reports pending review", tone: "default" },
            ].map((a) => (
              <div key={a.title} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
                <div className="text-sm">{a.title}</div>
                <Badge variant={a.tone as "default" | "secondary"}>Action</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}