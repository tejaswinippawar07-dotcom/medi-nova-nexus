CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  title text NOT NULL,
  report_type text NOT NULL DEFAULT 'laboratory',
  file_url text,
  notes text,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports read" ON public.reports FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR EXISTS (SELECT 1 FROM public.patients p WHERE p.id = reports.patient_id AND p.user_id = auth.uid()));

CREATE POLICY "reports staff write" ON public.reports FOR ALL TO authenticated
USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER audit_reports AFTER INSERT OR UPDATE OR DELETE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text,
  type text NOT NULL DEFAULT 'info',
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications view own" ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "notifications update own" ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications delete own" ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "notifications insert by signed in" ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);

CREATE INDEX notifications_user_idx ON public.notifications (user_id, created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;