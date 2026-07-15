import { Link } from "@tanstack/react-router";
import { Menu, Moon, Sun, Stethoscope, X } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/hospital/theme";
import { useAuth } from "@/lib/hospital/auth";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/departments", label: "Departments" },
  { to: "/doctors", label: "Doctors" },
  { to: "/services", label: "Services" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { theme, toggle } = useTheme();
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-sm font-semibold">LifeCare</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Multispeciality Hospital</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {user ? (
            <Link to={role === "admin" ? "/dashboard/admin" : role === "doctor" ? "/dashboard/doctor" : "/dashboard/patient"}>
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/auth" className="hidden sm:inline-flex">
                <Button size="sm" variant="ghost">Sign in</Button>
              </Link>
              <Link to="/appointment">
                <Button size="sm">Book appointment</Button>
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground [&.active]:text-foreground">
                {n.label}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}