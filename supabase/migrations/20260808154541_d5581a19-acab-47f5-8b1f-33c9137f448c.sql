
CREATE OR REPLACE FUNCTION public.pay_bill(_bill_id uuid, _method text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _method NOT IN ('cash','upi','card','insurance') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.billing b JOIN public.patients p ON p.id = b.patient_id
    WHERE b.id = _bill_id AND (p.user_id = auth.uid() OR public.is_staff(auth.uid()))
  ) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  UPDATE public.billing SET payment_status = 'paid', payment_method = _method WHERE id = _bill_id;
END; $$;

REVOKE EXECUTE ON FUNCTION public.pay_bill(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pay_bill(uuid, text) TO authenticated;
