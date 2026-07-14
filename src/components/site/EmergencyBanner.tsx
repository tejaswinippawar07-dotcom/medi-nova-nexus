import { Phone, Siren } from "lucide-react";
import { HOSPITAL } from "@/lib/hospital/data";

export function EmergencyBanner() {
  return (
    <div className="w-full bg-emergency text-emergency-foreground">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 font-medium">
          <Siren className="h-4 w-4" />
          <span className="hidden sm:inline">24/7 Level I Trauma Center — response within 8 minutes.</span>
          <span className="sm:hidden">24/7 Emergency</span>
        </div>
        <a href={`tel:${HOSPITAL.emergency}`} className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 font-semibold backdrop-blur transition hover:bg-white/25">
          <Phone className="h-3.5 w-3.5" /> {HOSPITAL.emergency}
        </a>
      </div>
    </div>
  );
}