import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LifeCare Hospital" },
      { name: "description", content: "Sign in to your LifeCare patient, doctor, or admin portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(72);

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [loading, setLoading] = useState(false);

  const go = (r: string) => navigate({ to: r === "admin" ? "/dashboard/admin" : r === "doctor" ? "/dashboard/doctor" : "/dashboard/patient" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailR = emailSchema.safeParse(email);
    const passR = passwordSchema.safeParse(password);
    if (!emailR.success || !passR.success) { toast.error("Enter a valid email and 6+ character password."); return; }
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: name, role } },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      if (data.session) { toast.success("Welcome to LifeCare"); go(role); }
      else { toast.success("Check your email to confirm your account."); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      const { data: u } = await supabase.auth.getUser();
      const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", u.user!.id).limit(1).maybeSingle();
      toast.success("Welcome back");
      go(r?.role ?? "patient");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden bg-gradient-hero p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur"><Stethoscope className="h-5 w-5" /></span>
          <div className="leading-tight"><div className="text-sm font-semibold">LifeCare</div><div className="text-[10px] uppercase tracking-widest text-white/70">Multispeciality Hospital</div></div>
        </Link>
        <div>
          <div className="text-xs uppercase tracking-widest text-white/70">Your portal</div>
          <h2 className="mt-3 font-display text-5xl leading-tight">Care that follows you home.</h2>
          <p className="mt-4 max-w-md text-white/85">Book appointments, view prescriptions, download reports, and message your care team — from anywhere.</p>
        </div>
        <div className="text-xs text-white/70">© {new Date().getFullYear()} LifeCare · Accredited by NABH & JCI</div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <Card className="w-full max-w-md rounded-3xl border-border/60 p-8 shadow-card">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
          <h1 className="mt-4 font-display text-3xl">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in or create your account.</p>

          <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-5">
              <form onSubmit={submit} className="space-y-4">
                <div><Label>Email</Label><Input className="mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>Password</Label><Input className="mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="mt-5">
              <form onSubmit={submit} className="space-y-4">
                <div><Label>Full name</Label><Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><Label>I am a</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as "patient" | "doctor" | "admin")}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Email</Label><Input className="mt-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                <div><Label>Password</Label><Input className="mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                <Button type="submit" className="w-full rounded-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}