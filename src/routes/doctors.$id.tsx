import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Award, Clock, Globe, Star } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DOCTORS } from "@/lib/hospital/data";

export const Route = createFileRoute("/doctors/$id")({
  loader: ({ params }) => {
    const doc = DOCTORS.find((d) => d.id === params.id);
    if (!doc) throw notFound();
    return { doc };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.doc.name} — ${loaderData.doc.department} · LifeCare` },
          { name: "description", content: loaderData.doc.bio.slice(0, 155) },
          { property: "og:title", content: `${loaderData.doc.name} — LifeCare` },
          { property: "og:description", content: `${loaderData.doc.department} · ${loaderData.doc.experience} years experience` },
        ]
      : [{ title: "Doctor — LifeCare" }, { name: "robots", content: "noindex" }],
  }),
  component: DoctorPage,
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-32 text-center">
        <h1 className="font-display text-5xl">Doctor not found</h1>
        <Link to="/doctors" className="mt-6 inline-block text-primary underline">Browse all doctors</Link>
      </div>
    </PublicLayout>
  ),
});

function DoctorPage() {
  const { doc } = Route.useLoaderData();
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/doctors" className="text-sm text-muted-foreground hover:text-foreground">← All doctors</Link>
        <div className="mt-6 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div>
            <div className="aspect-square rounded-3xl bg-gradient-hero p-6 text-primary-foreground shadow-elegant">
              <div className="grid h-full place-items-center rounded-2xl bg-white/10 backdrop-blur">
                <span className="font-display text-8xl">{doc.name.split(" ")[1]?.[0]}{doc.name.split(" ")[2]?.[0]}</span>
              </div>
            </div>
            <Card className="mt-5 rounded-3xl border-border/60 p-5 shadow-card">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Consultation fee</div>
              <div className="mt-2 font-display text-4xl">₹{doc.fee}</div>
              <Link to="/appointment">
                <Button className="mt-4 w-full rounded-full">Book appointment</Button>
              </Link>
            </Card>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-primary">{doc.department}</div>
            <h1 className="mt-2 font-display text-5xl">{doc.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Award className="h-4 w-4" /> {doc.qualification}</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {doc.experience} years</span>
              <span className="flex items-center gap-1 text-amber-500"><Star className="h-4 w-4 fill-current" /> {doc.rating} ({doc.reviews} reviews)</span>
              <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {doc.languages.join(", ")}</span>
            </div>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{doc.bio}</p>

            <h2 className="mt-10 font-display text-2xl">Weekly schedule</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {doc.schedule.map((s: { day: string; slots: string[] }) => (
                <Card key={s.day} className="rounded-2xl border-border/60 p-4">
                  <div className="text-sm font-semibold">{s.day}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {s.slots.length === 0 ? (
                      <span className="text-xs text-muted-foreground">Closed</span>
                    ) : (
                      s.slots.map((t: string) => (
                        <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs">{t}</span>
                      ))
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}