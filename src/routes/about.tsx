import { createFileRoute } from "@tanstack/react-router";
import { Award, HeartHandshake, Microscope, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { HOSPITAL, TIMELINE, VALUES } from "@/lib/hospital/data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About LifeCare — Our story, mission, and values" },
      { name: "description", content: "Founded in 1998, LifeCare is a 640-bed multispeciality hospital with a Level I trauma center, NABH and JCI accreditation, and 38 clinical awards." },
      { property: "og:title", content: "About LifeCare Multispeciality Hospital" },
      { property: "og:description", content: "Our mission, vision, values, and 28 years of clinical excellence." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-widest text-primary">Our story</div>
        <h1 className="mt-4 font-display text-5xl sm:text-6xl">Care as the constant. Everything else evolves.</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          For nearly three decades, {HOSPITAL.name} has combined the intimacy of community medicine with the capability of an academic center. Today we care for over a million patients a year across ten specialties.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="rounded-3xl border-border/60 p-8 shadow-card">
            <div className="text-xs uppercase tracking-widest text-primary">Mission</div>
            <p className="mt-4 font-display text-3xl leading-tight">To deliver world-class, human-centered healthcare — accessible to every family we serve.</p>
          </Card>
          <Card className="rounded-3xl border-border/60 p-8 shadow-card">
            <div className="text-xs uppercase tracking-widest text-primary">Vision</div>
            <p className="mt-4 font-display text-3xl leading-tight">A hospital where medicine, technology, and compassion are inseparable.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl">Core values</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v, i) => {
            const Icon = [HeartHandshake, Microscope, ShieldCheck, Award][i];
            return (
              <Card key={v.title} className="rounded-3xl border-border/60 p-6 shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-5 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl">Timeline</h2>
          <div className="mt-10 space-y-6 border-l border-border pl-8">
            {TIMELINE.map((t) => (
              <div key={t.year} className="relative">
                <span className="absolute -left-[42px] top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">•</span>
                <div className="text-xs uppercase tracking-widest text-primary">{t.year}</div>
                <h3 className="mt-1 text-xl font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl">Accreditations & awards</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["NABH Accredited","JCI Certified","ISO 9001:2015","NABL Laboratory","Green OT Certified","Ranked Top 10 Cardiac Center 2025","Best Emergency Response 2024","Innovation in AI Health 2026"].map((a) => (
            <div key={a} className="rounded-2xl border border-border/60 bg-card p-5 text-sm">
              <Award className="h-4 w-4 text-primary" />
              <div className="mt-3 font-medium">{a}</div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}