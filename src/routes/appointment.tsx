import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DEPARTMENTS, DOCTORS } from "@/lib/hospital/data";
import { useAuth } from "@/lib/hospital/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/appointment")({
  head: () => ({
    meta: [
      { title: "Book an appointment — LifeCare Hospital" },
      { name: "description", content: "Book a consultation with any of LifeCare's 25 board-certified specialists in just a few clicks." },
      { property: "og:title", content: "Book an appointment" },
      { property: "og:description", content: "Same-day appointments available." },
    ],
  }),
  component: BookAppointment,
});

const schema = z.object({
  department: z.string().min(1),
  doctor: z.string().min(1),
  date: z.date(),
  slot: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(6).max(30),
  reason: z.string().trim().max(500).optional(),
});

function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dept, setDept] = useState("");
  const [doctor, setDoctor] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const doctors = useMemo(() => DOCTORS.filter((d) => !dept || d.departmentSlug === dept), [dept]);
  const selectedDoc = DOCTORS.find((d) => d.id === doctor);
  const availableSlots = useMemo(() => {
    if (!selectedDoc || !date) return [] as string[];
    const dayKey = format(date, "EEE");
    return selectedDoc.schedule.find((s) => s.day === dayKey)?.slots ?? [];
  }, [selectedDoc, date]);
  const isClosedDay = Boolean(selectedDoc && date && availableSlots.length === 0);
  const slotPlaceholder = !selectedDoc
    ? "Select a doctor first"
    : !date
      ? "Pick a date first"
      : isClosedDay
        ? "No slots this day"
        : "Select time";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ department: dept, doctor, date, slot, name, phone, reason });
    if (!parsed.success) { toast.error("Please complete every required field."); return; }
    if (!user) {
      toast.error("Please sign in to confirm your booking.");
      navigate({ to: "/auth" });
      return;
    }
    setSubmitting(true);
    const doc = selectedDoc!;
    const { error } = await supabase.from("appointments").insert({
      patient_id: user.id,
      doctor_slug: doc.id,
      doctor_name: doc.name,
      department: doc.department,
      appointment_date: format(date!, "yyyy-MM-dd"),
      appointment_time: slot,
      reason,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  };

  if (done) {
    return (
      <PublicLayout>
        <section className="mx-auto max-w-2xl px-4 py-24 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
          <h1 className="mt-6 font-display text-5xl">Appointment confirmed</h1>
          <p className="mt-4 text-muted-foreground">You'll receive an SMS and email reminder before your visit.</p>
          <Button className="mt-8 rounded-full" onClick={() => navigate({ to: "/dashboard/patient" })}>View in dashboard</Button>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-widest text-primary">Book appointment</div>
        <h1 className="mt-3 font-display text-5xl">Schedule your visit.</h1>
        <p className="mt-4 text-muted-foreground">Six quick steps — under 60 seconds.</p>

        <Card className="mt-10 rounded-3xl border-border/60 p-8 shadow-card">
          <form onSubmit={submit} className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Department</Label>
              <Select value={dept} onValueChange={(v) => { setDept(v); setDoctor(""); }}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d.slug} value={d.slug}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Doctor</Label>
              <Select value={doctor} onValueChange={(v) => { setDoctor(v); setSlot(""); }}>
                <SelectTrigger className="mt-2"><SelectValue placeholder={dept ? "Select doctor" : "Choose a department first"} /></SelectTrigger>
                <SelectContent>{doctors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} · ₹{d.fee}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("mt-2 w-full justify-start rounded-md text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setSlot(""); }}
                    initialFocus
                    disabled={(d) => {
                      const today = new Date(); today.setHours(0, 0, 0, 0);
                      if (d < today) return true;
                      if (!selectedDoc) return false;
                      const day = selectedDoc.schedule.find((s) => s.day === format(d, "EEE"));
                      return !day || day.slots.length === 0;
                    }}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Time slot</Label>
              <Select value={slot} onValueChange={setSlot} disabled={availableSlots.length === 0}>
                <SelectTrigger className="mt-2"><SelectValue placeholder={slotPlaceholder} /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {availableSlots.map((s: string) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              {isClosedDay && (
                <p className="mt-2 text-xs text-muted-foreground">{selectedDoc?.name} isn't consulting on {format(date!, "EEEE")}. Please pick another date.</p>
              )}
            </div>
            <div>
              <Label>Full name</Label>
              <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-2" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Reason for visit (optional)</Label>
              <Textarea className="mt-2" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedDoc && <>Consultation fee: <span className="font-semibold text-foreground">₹{selectedDoc.fee}</span></>}
              </div>
              <Button type="submit" size="lg" className="rounded-full" disabled={submitting}>
                {submitting ? "Booking…" : user ? "Confirm booking" : "Sign in to confirm"}
              </Button>
            </div>
          </form>
        </Card>
      </section>
    </PublicLayout>
  );
}