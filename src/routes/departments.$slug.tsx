import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DEPARTMENTS, DOCTORS } from "@/lib/hospital/data";

export const Route = createFileRoute("/departments/$slug")({
  loader: ({ params }) => {
    const dept = DEPARTMENTS.find((d) => d.slug === params.slug);
    if (!dept) throw notFound();
    return { dept };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.dept.name} — LifeCare Hospital` },
          { name: "description", content: loaderData.dept.description },
          { property: "og:title", content: `${loaderData.dept.name} at LifeCare` },
          { property: "og:description", content: loaderData.dept.tagline },
        ]
      : [{ title: "Department — LifeCare" }, { name: "robots", content: "noindex" }],
  }),
  component: DeptPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="font-display text-5xl">Department not found</h1>
        <p className="mt-4 text-muted-foreground">Try browsing all departments.</p>
        <Link to="/departments" className="mt-6 inline-block text-primary underline">All departments</Link>
      </div>
    </PublicLayout>
  ),
});

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Circle;
  return <C className={className} />;
}

function DeptPage() {
  const { dept } = Route.useLoaderData();
  const doctors = DOCTORS.filter((d) => d.departmentSlug === dept.slug);
  return (
    <PublicLayout>
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Link to="/departments" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white">← All departments</Link>
          <div className="mt-6 flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Icon name={dept.icon} className="h-7 w-7" /></span>
            <div>
              <div className="text-xs uppercase tracking-widest text-white/70">Department</div>
              <h1 className="mt-1 font-display text-5xl">{dept.name}</h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-lg text-white/90">{dept.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/appointment"><Button variant="secondary" className="rounded-full">Book appointment</Button></Link>
            <Link to="/doctors"><Button variant="ghost" className="rounded-full border border-white/25 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">Meet the team</Button></Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <Card className="rounded-3xl border-border/60 p-6 shadow-card">
            <h3 className="text-lg font-semibold">Services offered</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {dept.services.map((s: string) => (
                <li key={s} className="flex items-center gap-2"><Icons.Check className="h-4 w-4 text-primary" /> {s}</li>
              ))}
            </ul>
          </Card>
          <Card className="rounded-3xl border-border/60 p-6 shadow-card">
            <h3 className="text-lg font-semibold">Equipment & facilities</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {["Advanced imaging suite","Dedicated procedure rooms","24/7 nursing coverage","On-site pharmacy","Integrated EMR & AI triage"].map((s) => (
                <li key={s} className="flex items-center gap-2"><Icons.Check className="h-4 w-4 text-primary" /> {s}</li>
              ))}
            </ul>
          </Card>
          <Card className="rounded-3xl border-border/60 p-6 shadow-card">
            <h3 className="text-lg font-semibold">Operating hours</h3>
            <p className="mt-4 text-sm text-muted-foreground">{dept.hours}</p>
            <p className="mt-4 text-xs text-muted-foreground">For urgent concerns, call our 24/7 emergency line.</p>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl">Doctors in this department</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.map((doc) => (
            <Link key={doc.id} to="/doctors/$id" params={{ id: doc.id }}>
              <Card className="h-full rounded-2xl border-border/60 p-5 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="text-sm font-semibold">{doc.name}</div>
                <div className="text-xs text-muted-foreground">{doc.qualification} · {doc.experience} yrs</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-amber-500"><Icons.Star className="h-3 w-3 fill-current" /> {doc.rating}</span>
                  <span className="font-semibold text-foreground">${doc.fee}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}