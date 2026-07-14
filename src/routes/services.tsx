import { createFileRoute } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { SERVICES } from "@/lib/hospital/data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — MediNova Hospital" },
      { name: "description", content: "Outpatient, inpatient, ICU, pharmacy, laboratory, ambulance, health packages, emergency care, and telemedicine — under one roof." },
      { property: "og:title", content: "Services at MediNova" },
      { property: "og:description", content: "Everything a modern hospital should offer." },
    ],
  }),
  component: ServicesPage,
});

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Circle;
  return <C className={className} />;
}

function ServicesPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-widest text-primary">Services</div>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Full-spectrum care.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">From same-day consults to critical care — everything a modern hospital should offer, under one roof.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <Card key={s.name} className="rounded-3xl border-border/60 p-6 shadow-card">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary"><Icon name={s.icon} className="h-5 w-5" /></span>
              <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}