-- Prevent double booking: one active appointment per doctor, date and time slot.
CREATE UNIQUE INDEX IF NOT EXISTS appointments_doctor_slot_active_idx
  ON public.appointments (doctor_id, appointment_date, appointment_time)
  WHERE doctor_id IS NOT NULL AND status IN ('pending', 'confirmed', 'completed');

-- ============ EMR: patient history (allergies, chronic conditions, surgeries, family history, medications) ============
CREATE TABLE public.patient_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'allergy', -- allergy | chronic | surgery | family | medication | immunisation
  title text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'active', -- active | resolved
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT patient_history_category_check CHECK (category IN ('allergy','chronic','surgery','family','medication','immunisation')),
  CONSTRAINT patient_history_status_check CHECK (status IN ('active','resolved'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_history TO authenticated;
GRANT ALL ON public.patient_history TO service_role;
ALTER TABLE public.patient_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history staff read" ON public.patient_history
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));
CREATE POLICY "history staff write" ON public.patient_history
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- ============ EMR: vital signs ============
CREATE TABLE public.vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  recorded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  blood_pressure text,
  pulse integer,
  temperature_c numeric(4,1),
  spo2 integer,
  weight_kg numeric(5,1),
  height_cm numeric(5,1),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vitals_spo2_range CHECK (spo2 IS NULL OR (spo2 >= 50 AND spo2 <= 100)),
  CONSTRAINT vitals_pulse_range CHECK (pulse IS NULL OR (pulse > 0 AND pulse < 300))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vitals TO authenticated;
GRANT ALL ON public.vitals TO service_role;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vitals staff read" ON public.vitals
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));
CREATE POLICY "vitals staff write" ON public.vitals
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- ============ EMR: clinical notes (diagnosis, treatment, follow-up) ============
CREATE TABLE public.clinical_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  visit_date date NOT NULL DEFAULT CURRENT_DATE,
  diagnosis text NOT NULL,
  treatment_plan text,
  doctor_notes text,
  follow_up_date date,
  follow_up_notes text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinical_notes TO authenticated;
GRANT ALL ON public.clinical_notes TO service_role;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes staff read" ON public.clinical_notes
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.patients p WHERE p.id = patient_id AND p.user_id = auth.uid()));
CREATE POLICY "notes treating doctor inserts" ON public.clinical_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.id = doctor_id)
  );
CREATE POLICY "notes treating doctor updates" ON public.clinical_notes
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.id = doctor_id)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR EXISTS (SELECT 1 FROM public.doctors d WHERE d.user_id = auth.uid() AND d.id = doctor_id)
  );
CREATE POLICY "notes admin delete" ON public.clinical_notes
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ Housekeeping: updated_at + audit trails on all EMR tables ============
CREATE TRIGGER patient_history_updated_at BEFORE UPDATE ON public.patient_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER vitals_updated_at BEFORE UPDATE ON public.vitals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER clinical_notes_updated_at BEFORE UPDATE ON public.clinical_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER audit_patient_history AFTER INSERT OR UPDATE OR DELETE ON public.patient_history
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_vitals AFTER INSERT OR UPDATE OR DELETE ON public.vitals
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();
CREATE TRIGGER audit_clinical_notes AFTER INSERT OR UPDATE OR DELETE ON public.clinical_notes
  FOR EACH ROW EXECUTE FUNCTION public.write_audit_log();