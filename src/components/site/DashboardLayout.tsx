import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Stethoscope, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { roleHome, useAuth, type Role } from "@/lib/hospital/auth";
import { useTheme } from "@/lib/hospital/theme";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/hms/NotificationBell";

export function DashboardLayout({ title, nav, children, allowedRoles }: {
  title: string;
  allowedRoles: Role[];
  nav: { to: string; label: string; icon: ReactNode }[];
  children: ReactNode;
}) {
  const { user, role, loading, roleLoading, refreshRole, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (roleLoading) return;
    if (role && !allowedRoles.includes(role)) navigate({ to: roleHome[role] });
  }, [loading, roleLoading, user, role, allowedRoles, navigate]);

  if (loading || !user || roleLoading) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>;
  }

  if (!role) {
    return (
      <div className="grid min-h-screen place-items-center p-6 text-center text-sm text-muted-foreground">
        <div className="max-w-sm">
          <p className="font-medium text-foreground">No role is assigned to this account</p>
          <p className="mt-2">
            You're signed in as {user.email}, but no access level has been granted yet. Ask an administrator to
            assign your role in Admin console → Users, then retry.
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refreshRole()}>Retry</Button>
            <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Redirecting…</div>;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border/60 bg-sidebar p-6 lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant"><Stethoscope className="h-5 w-5" /></span>
          <div className="leading-tight"><div className="text-sm font-semibold text-sidebar-foreground">LifeCare</div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{title}</div></div>
        </Link>
        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground">
              {n.icon}{n.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" className="justify-start gap-2 text-muted-foreground" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/60 bg-background/75 px-6 backdrop-blur">
          <div className="text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">{user.email}</span></div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={toggle} aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}