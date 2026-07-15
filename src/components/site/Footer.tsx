import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Stethoscope, Twitter } from "lucide-react";
import { HOSPITAL } from "@/lib/hospital/data";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-gradient-soft">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
              <Stethoscope className="h-5 w-5" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">LifeCare</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Multispeciality Hospital</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{HOSPITAL.tagline}</p>
          <div className="mt-4 flex gap-2 text-muted-foreground">
            {[Facebook, Twitter, Instagram, Linkedin].map((I, i) => (
              <a key={i} href="#" aria-label="Social" className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 transition-colors hover:bg-accent hover:text-accent-foreground">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {[["/about","About"],["/departments","Departments"],["/doctors","Doctors"],["/services","Services"],["/appointment","Book Appointment"]].map(([to,l]) => (
              <li key={to}><Link to={to} className="hover:text-foreground">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Patients</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-foreground">Patient portal</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Health packages</Link></li>
            <li><Link to="/services" className="hover:text-foreground">Telemedicine</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Insurance & billing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{HOSPITAL.address}</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{HOSPITAL.phone}</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{HOSPITAL.email}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} LifeCare Multispeciality Hospital. All rights reserved.</span>
          <span>Accredited by NABH · JCI · ISO 9001:2015</span>
        </div>
      </div>
    </footer>
  );
}