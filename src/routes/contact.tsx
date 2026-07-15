import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Siren } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HOSPITAL } from "@/lib/hospital/data";

const schema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(5, "Please share a few more words").max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact LifeCare Hospital" },
      { name: "description", content: `Reach ${HOSPITAL.name}: 24/7 emergency hotline, contact form, address, and directions.` },
      { property: "og:title", content: "Contact LifeCare" },
      { property: "og:description", content: "24/7 emergency hotline, general inquiries, directions." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    toast.success("Message received — we'll be in touch within one business day.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-widest text-primary">Contact</div>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Let's talk.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">General inquiries, billing questions, media, or careers — we're happy to help.</p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-3xl border-border/60 p-8 shadow-card">
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="msg">How can we help?</Label>
                <Textarea id="msg" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2" />
              </div>
              <Button type="submit" className="rounded-full sm:col-span-2 sm:w-max">Send message</Button>
            </form>
          </Card>

          <div className="space-y-4">
            <Card className="rounded-3xl border-border/60 p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emergency text-emergency-foreground"><Siren className="h-5 w-5" /></span>
              <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">Emergency hotline</div>
              <a href={`tel:${HOSPITAL.emergency}`} className="mt-1 block font-display text-3xl text-emergency">{HOSPITAL.emergency} / {HOSPITAL.emergencyAlt}</a>
              <p className="mt-2 text-xs text-muted-foreground">National Ambulance · National Emergency · 24×7</p>
            </Card>
            <Card className="rounded-3xl border-border/60 p-6 shadow-card">
              <div className="flex items-start gap-3"><Phone className="mt-1 h-4 w-4 text-primary" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Reception</div><div className="mt-1 font-semibold">{HOSPITAL.phone}</div></div></div>
              <div className="mt-4 flex items-start gap-3"><Mail className="mt-1 h-4 w-4 text-primary" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Email</div><div className="mt-1 font-semibold">{HOSPITAL.email}</div></div></div>
              <div className="mt-4 flex items-start gap-3"><MapPin className="mt-1 h-4 w-4 text-primary" /><div><div className="text-xs uppercase tracking-widest text-muted-foreground">Address</div><div className="mt-1 text-sm">{HOSPITAL.address}</div></div></div>
            </Card>
            <div className="aspect-video overflow-hidden rounded-3xl border border-border/60 bg-gradient-soft shadow-card">
              <div className="grid h-full place-items-center text-muted-foreground">
                <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> Map preview</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}