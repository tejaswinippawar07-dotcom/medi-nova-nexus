import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { DEPARTMENTS } from "@/lib/hospital/data";

export const Route = createFileRoute("/departments")({
  head: () => ({
    meta: [
      { title: "Departments — MediNova Hospital" },
      { name: "description", content: "Ten centers of excellence: cardiology, neurology, orthopedics, pediatrics, gynecology, oncology, dermatology, ENT, emergency, and ICU." },
      { property: "og:title", content: "Departments at MediNova" },
      { property: "og:description", content: "Ten centers of excellence across the full spectrum of care." },
    ],
  }),
  component: DepartmentsIndex,
});

function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Circle;
  return <C className={className} />;
}

function DepartmentsIndex() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-widest text-primary">Departments</div>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Ten centers of excellence.</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Every department is led by fellowship-trained specialists and supported by shared operating theatres, imaging, and pharmacy.</p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d) => (
            <Link key={d.slug} to="/departments/$slug" params={{ slug: d.slug }}>
              <Card className="group h-full rounded-3xl border-border/60 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground transition"><Icon name={d.icon} className="h-5 w-5" /></span>
                  <div>
                    <div className="text-lg font-semibold">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.tagline}</div>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{d.description}</p>
                <div className="mt-6 flex items-center gap-1 text-sm font-medium text-primary">Explore <Icons.ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}