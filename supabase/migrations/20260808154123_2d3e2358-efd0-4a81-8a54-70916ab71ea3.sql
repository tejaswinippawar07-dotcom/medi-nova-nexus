
CREATE OR REPLACE FUNCTION public.notify_users(_user_ids uuid[], _title text, _message text, _type text, _link text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT u, _title, _message, _type, _link FROM unnest(_user_ids) AS u WHERE u IS NOT NULL;
$$;

REVOKE EXECUTE ON FUNCTION public.notify_users(uuid[], text, text, text, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.staff_user_ids()
RETURNS uuid[] LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(array_agg(user_id), '{}'::uuid[]) FROM public.user_roles WHERE role IN ('admin','receptionist');
$$;

REVOKE EXECUTE ON FUNCTION public.staff_user_ids() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.on_appointment_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  doc_user uuid;
  pat_user uuid;
BEGIN
  SELECT user_id INTO doc_user FROM public.doctors WHERE id = NEW.doctor_id;
  pat_user := NEW.patient_id;
  IF pat_user IS NULL AND NEW.patient_record_id IS NOT NULL THEN
    SELECT user_id INTO pat_user FROM public.patients WHERE id = NEW.patient_record_id;
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM public.notify_users(public.staff_user_ids(), 'New appointment booked',
      NEW.doctor_name || ' · ' || to_char(NEW.appointment_date, 'DD/MM/YYYY') || ' at ' || NEW.appointment_time,
      'appointment', '/dashboard/receptionist');
    PERFORM public.notify_users(ARRAY[pat_user], 'Appointment requested',
      'Your appointment with ' || NEW.doctor_name || ' is pending confirmation.', 'appointment', '/dashboard/patient');
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    PERFORM public.notify_users(ARRAY[pat_user, doc_user], 'Appointment ' || NEW.status,
      NEW.doctor_name || ' · ' || to_char(NEW.appointment_date, 'DD/MM/YYYY') || ' at ' || NEW.appointment_time,
      'appointment', NULL);
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER notify_appointment AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.on_appointment_change();

CREATE OR REPLACE FUNCTION public.on_report_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pat_user uuid;
BEGIN
  SELECT user_id INTO pat_user FROM public.patients WHERE id = NEW.patient_id;
  PERFORM public.notify_users(ARRAY[pat_user], 'New report available', NEW.title, 'report', '/dashboard/patient');
  RETURN NEW;
END; $$;

CREATE TRIGGER notify_report AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.on_report_created();

CREATE OR REPLACE FUNCTION public.on_bill_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pat_user uuid;
BEGIN
  SELECT user_id INTO pat_user FROM public.patients WHERE id = NEW.patient_id;
  PERFORM public.notify_users(ARRAY[pat_user], 'New bill generated',
    'Bill ' || NEW.bill_number || ' for Rs. ' || COALESCE(NEW.total_amount, 0), 'billing', '/dashboard/patient');
  RETURN NEW;
END; $$;

CREATE TRIGGER notify_bill AFTER INSERT ON public.billing
FOR EACH ROW EXECUTE FUNCTION public.on_bill_created();
