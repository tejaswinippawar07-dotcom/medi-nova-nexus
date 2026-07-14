import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEPARTMENTS, DOCTORS, HOSPITAL, NEWS, STATS, TESTIMONIALS } from "@/lib/hospital/data";

export const Route = createFileRoute("/")({
  component: Index,
});

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Circle;
  return <C className={className} />;
}

function Index() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" aria-hidden />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15), transparent 40%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.12), transparent 40%)" }} aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 text-primary-foreground sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <Badge className="border-white/20 bg-white/10 text-primary-foreground backdrop-blur">Now offering AI-assisted diagnostics</Badge>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Healthcare that <em className="italic opacity-90">actually</em> feels caring.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              {HOSPITAL.name} brings 250+ board-certified specialists, a Level I trauma center, and next-generation imaging under one roof — all built around the patient.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/appointment"><Button size="lg" variant="secondary" className="rounded-full shadow-elegant">Book an appointment</Button></Link>
              <Link to="/doctors"><Button size="lg" variant="ghost" className="rounded-full border border-white/25 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">Find a doctor →</Button></Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl">{s.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-white/70">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-elegant">
              <div className="text-xs uppercase tracking-widest text-white/70">Quick appointment</div>
              <div className="mt-4 space-y-3">
                {DEPARTMENTS.slice(0, 4).map((d) => (
                  <Link key={d.slug} to="/departments/$slug" params={{ slug: d.slug }} className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-4 transition hover:bg-white/10">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Icon name={d.icon} className="h-5 w-5" /></span>
                      <div>
                        <div className="text-sm font-semibold">{d.name}</div>
                        <div className="text-xs text-white/70">{d.tagline}</div>
                      </div>
                    </div>
                    <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
              <Link to="/departments" className="mt-4 flex items-center justify-center gap-1 text-sm text-white/80 hover:text-white">View all 10 departments →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Centers of excellence</div>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">Featured departments</h2>
          </div>
          <Link to="/departments" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">All departments →</Link>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.slice(0, 6).map((d) => (
            <Link key={d.slug} to="/departments/$slug" params={{ slug: d.slug }}>
              <Card className="group h-full rounded-3xl border-border/60 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition"><Icon name={d.icon} className="h-5 w-5" /></span>
                  <div>
                    <div className="text-lg font-semibold">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.tagline}</div>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{d.description}</p>
                <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">Learn more <Icons.ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Doctors */}
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary">Meet the team</div>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">Featured doctors</h2>
            </div>
            <Link to="/doctors" className="hidden text-sm text-muted-foreground hover:text-foreground sm:block">All 25 doctors →</Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {DOCTORS.slice(0, 4).map((doc) => (
              <Link key={doc.id} to="/doctors/$id" params={{ id: doc.id }}>
                <Card className="group h-full overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
                  <div className="aspect-square bg-gradient-hero p-6 text-primary-foreground">
                    <div className="grid h-full place-items-center rounded-2xl bg-white/10 backdrop-blur">
                      <span className="font-display text-6xl">{doc.name.split(" ")[1]?.[0]}{doc.name.split(" ")[2]?.[0]}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Icons.Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-medium">{doc.rating}</span>
                      <span className="text-muted-foreground">({doc.reviews})</span>
                    </div>
                    <div className="mt-2 text-base font-semibold">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.department} · {doc.experience} yrs</div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold">${doc.fee}</span>
                      <span className="text-xs font-medium text-primary">Book →</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary">Patient stories</div>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl">Real people, real recoveries.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="rounded-3xl border-border/60 p-7 shadow-card">
              <Icons.Quote className="h-6 w-6 text-primary/40" />
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">{t.quote}</p>
              <div className="mt-6 border-t border-border/60 pt-4">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* News */}
      <section className="bg-gradient-soft">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary">From the newsroom</div>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">Latest updates</h2>
            </div>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {NEWS.map((n) => (
              <Card key={n.title} className="rounded-3xl border-border/60 p-7 shadow-card">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{n.date}</div>
                <h3 className="mt-3 text-lg font-semibold leading-snug">{n.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{n.excerpt}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-hero p-10 text-primary-foreground shadow-elegant sm:p-16">
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl sm:text-5xl">Talk to a specialist today.</h2>
            <p className="mt-4 text-white/85">Same-day appointments available across most departments. Video consults from anywhere.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/appointment"><Button size="lg" variant="secondary" className="rounded-full">Book appointment</Button></Link>
              <a href={`tel:${HOSPITAL.emergency}`}><Button size="lg" variant="ghost" className="rounded-full border border-white/25 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">Emergency line</Button></a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
