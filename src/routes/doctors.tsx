import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEPARTMENTS, DOCTORS } from "@/lib/hospital/data";

export const Route = createFileRoute("/doctors")({
  head: () => ({
    meta: [
      { title: "Find a doctor — MediNova Hospital" },
      { name: "description", content: "Browse 25 board-certified specialists at MediNova. Filter by department, search by name, and book online in minutes." },
      { property: "og:title", content: "Meet the doctors of MediNova" },
      { property: "og:description", content: "25 board-certified specialists across 10 departments." },
    ],
  }),
  component: DoctorsPage,
});

function DoctorsPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");

  const results = useMemo(() => {
    return DOCTORS.filter((d) => {
      const matchQ = q === "" || d.name.toLowerCase().includes(q.toLowerCase()) || d.department.toLowerCase().includes(q.toLowerCase());
      const matchD = dept === "all" || d.departmentSlug === dept;
      return matchQ && matchD;
    });
  }, [q, dept]);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-xs uppercase tracking-widest text-primary">Doctor directory</div>
        <h1 className="mt-3 font-display text-5xl sm:text-6xl">Find your specialist.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">25 board-certified specialists, filterable by department. Every profile shows availability, fees, and languages spoken.</p>

        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors by name or department" className="pl-9 border-0 bg-transparent shadow-none focus-visible:ring-0" />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-full border-0 bg-secondary sm:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((d) => <SelectItem key={d.slug} value={d.slug}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">{results.length} doctor{results.length !== 1 && "s"}</div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((doc) => (
            <Link key={doc.id} to="/doctors/$id" params={{ id: doc.id }}>
              <Card className="group h-full overflow-hidden rounded-3xl border-border/60 shadow-card transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="aspect-square bg-gradient-hero p-6 text-primary-foreground">
                  <div className="grid h-full place-items-center rounded-2xl bg-white/10 backdrop-blur">
                    <span className="font-display text-6xl">{doc.name.split(" ")[1]?.[0]}{doc.name.split(" ")[2]?.[0]}</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-current" />
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
        {results.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
            No doctors match your filters.
          </div>
        )}
      </section>
    </PublicLayout>
  );
}