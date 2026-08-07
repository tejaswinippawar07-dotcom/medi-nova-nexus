import { createFileRoute } from "@tanstack/react-router";
import { Activity, Calendar, FileText, Home, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/site/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/doctor")({
  head: () => ({ meta: [{ title: "Doctor dashboard — LifeCare" }, { name: "robots", content: "noindex" }] }),
  component: DoctorDash,
});

type Appt = { id: string; doctor_name: string; department: string; appointment_date: string; appointment_time: string; status: string };

function DoctorDash() {
  const [appts, setAppts] = useState<Appt[]>([]);
  useEffect(() => {
    supabase.from("appointments").select("*").order("appointment_date", { ascending: false }).limit(20).then(({ data }) => setAppts((data as Appt[]) ?? []));
  }, []);

  return (
    <DashboardLayout
      title="Doctor portal"
      allowedRoles={["doctor"]}
      nav={[
        { to: "/dashboard/doctor", label: "Overview", icon: <Home className="h-4 w-4" /> },
        { to: "/dashboard/doctor", label: "Schedule", icon: <Calendar className="h-4 w-4" /> },
        { to: "/dashboard/doctor", label: "Patients", icon: <Users className="h-4 w-4" /> },
        { to: "/dashboard/doctor", label: "Prescriptions", icon: <Stethoscope className="h-4 w-4" /> },
        { to: "/dashboard/doctor", label: "Reports", icon: <FileText className="h-4 w-4" /> },
        { to: "/dashboard/doctor", label: "Analytics", icon: <Activity className="h-4 w-4" /> },
      ]}
    >
      <div className="font-display text-4xl">Today's schedule.</div>
      <p className="mt-2 text-muted-foreground">Your upcoming consults, prescriptions, and patient notes.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {[["Today","8"],["This week","32"],["Patients","1,204"],["Rating","4.9"]].map(([l,v]) => (
          <Card key={l} className="rounded-3xl border-border/60 p-6 shadow-card">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">{l}</div>
            <div className="mt-3 font-display text-4xl">{v}</div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 rounded-3xl border-border/60 p-6 shadow-card">
        <h2 className="text-lg font-semibold">Recent appointments</h2>
        <div className="mt-4 divide-y divide-border/60">
          {appts.length === 0 && <div className="py-6 text-sm text-muted-foreground">No appointments yet.</div>}
          {appts.map((a) => (
            <div key={a.id} className="grid grid-cols-[1fr_auto] items-center gap-4 py-4">
              <div>
                <div className="text-sm font-semibold">{a.doctor_name}</div>
                <div className="text-xs text-muted-foreground">{a.department} · {a.appointment_date} at {a.appointment_time}</div>
              </div>
              <Badge variant="secondary">{a.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}