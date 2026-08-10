GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.is_appointment_doctor(_appointment_doctor_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = _appointment_doctor_id AND d.user_id = _user_id)
$$;
REVOKE ALL ON FUNCTION public.is_appointment_doctor(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_appointment_doctor(uuid, uuid) TO authenticated;

DROP POLICY IF EXISTS "Patients view own appointments" ON public.appointments;
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT TO authenticated
USING (
  auth.uid() = patient_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_appointment_doctor(doctor_id, auth.uid())
);

DROP POLICY IF EXISTS "Patients update own appointments" ON public.appointments;
CREATE POLICY "Patients update own appointments" ON public.appointments FOR UPDATE TO authenticated
USING (
  auth.uid() = patient_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_appointment_doctor(doctor_id, auth.uid())
)
WITH CHECK (
  auth.uid() = patient_id
  OR public.has_role(auth.uid(), 'admin')
  OR public.is_appointment_doctor(doctor_id, auth.uid())
);