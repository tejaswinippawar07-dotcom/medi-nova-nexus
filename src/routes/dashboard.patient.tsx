import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, CreditCard, FileText, Home, Pill, User } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hospital/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/patient")({
  head: () => ({ meta: [{ title: "Patient dashboard — MediNova" }, { name: "robots", content: "noindex" }] }),
  component: PatientDash,
});

type Appt = { id: string; doctor_name: string; department: string; appointment_date: string; appointment_time: string; status: string };

function PatientDash() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("appointments").select("*").eq("patient_id", user.id).order("appointment_date", { ascending: false }).then(({ data }) => {
      setAppts((data as Appt[]) ?? []);
      setLoading(false);
    });
  }, [user]);

  return (
    <DashboardLayout
      title="Patient portal"
      requiredRole="patient"
      nav={[
        { to: "/dashboard/patient", label: "Overview", icon: <Home className="h-4 w-4" /> },
        { to: "/appointment", label: "Book appointment", icon: <Calendar className="h-4 w-4" /> },
        { to: "/dashboard/patient", label: "Prescriptions", icon: <Pill className="h-4 w-4" /> },
        { to: "/dashboard/patient", label: "Reports", icon: <FileText className="h-4 w-4" /> },
        { to: "/dashboard/patient", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
        { to: "/dashboard/patient", label: "Profile", icon: <User className="h-4 w-4" /> },
      ]}
    >
      <div className="font-display text-4xl">Welcome back.</div>
      <p className="mt-2 text-muted-foreground">Here's a snapshot of your care.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Upcoming visits", value: appts.filter(a => a.status === "pending").length },
          { label: "Prescriptions", value: 3 },
          { label: "Pending bills", value: "$240" },
          { label: "Unread reports", value: 1 },
        ].map((s) => (
          <Card key={s.label} className="rounded-3xl border-border/60 p-6 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className="mt-3 font-display text-4xl">{s.value}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 rounded-3xl border-border/60 p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My appointments</h2>
          <Link to="/appointment"><Button size="sm" className="rounded-full">Book new</Button></Link>
        </div>
        {loading ? (
          <div className="mt-6 text-sm text-muted-foreground">Loading…</div>
        ) : appts.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-border/60 p-10 text-center text-muted-foreground">No appointments yet. <Link to="/appointment" className="text-primary underline">Book your first visit</Link>.</div>
        ) : (
          <div className="mt-6 divide-y divide-border/60">
            {appts.map((a) => (
              <div key={a.id} className="grid grid-cols-[1fr_auto] items-center gap-4 py-4">
                <div>
                  <div className="text-sm font-semibold">{a.doctor_name}</div>
                  <div className="text-xs text-muted-foreground">{a.department} · {a.appointment_date} at {a.appointment_time}</div>
                </div>
                <Badge variant={a.status === "pending" ? "default" : "secondary"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}