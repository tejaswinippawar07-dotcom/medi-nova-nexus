import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/hospital/auth";

type Note = { id: string; title: string; message: string | null; type: string; read: boolean; created_at: string };

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function NotificationBell() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(30);
    setNotes((data as Note[]) ?? []);
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-bell")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as Note;
        setNotes((prev) => [n, ...prev]);
        toast(n.title, { description: n.message ?? undefined });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user]);

  const unread = notes.filter((n) => !n.read).length;

  const markAll = async () => {
    if (!user || unread === 0) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotes((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 rounded-2xl p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="text-sm font-semibold">Notifications</div>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => void markAll()}>
            <CheckCheck className="h-3 w-3" /> Mark all read
          </Button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notes.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted-foreground">Nothing yet.</div>}
          {notes.map((n) => (
            <div key={n.id} className={`border-b border-border/40 px-4 py-3 last:border-0 ${n.read ? "" : "bg-accent/40"}`}>
              <div className="text-sm font-medium">{n.title}</div>
              {n.message && <div className="mt-0.5 text-xs text-muted-foreground">{n.message}</div>}
              <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">{when(n.created_at)}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
