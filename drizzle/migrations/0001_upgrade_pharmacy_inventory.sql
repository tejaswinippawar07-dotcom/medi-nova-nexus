ALTER TABLE public.medicines
  ADD COLUMN category text,
  ADD COLUMN batch_number text,
  ADD COLUMN unit text DEFAULT 'strip',
  ADD COLUMN low_stock_threshold integer NOT NULL DEFAULT 10;
COMMENT ON COLUMN public.medicines.low_stock_threshold IS 'Staff are alerted when quantity falls to or below this value';

-- Immutable stock ledger: every change is a row, quantities are applied atomically by trigger.
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  change integer NOT NULL, -- positive = stock in (purchase/return), negative = stock out (dispense/expiry/adjustment)
  reason text NOT NULL DEFAULT 'adjustment', -- purchase | dispense | adjustment | expiry
  prescription_id uuid REFERENCES public.prescriptions(id) ON DELETE SET NULL,
  performed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_change_not_zero CHECK (change <> 0),
  CONSTRAINT stock_movements_reason_check CHECK (reason IN ('purchase','dispense','adjustment','expiry'))
);
GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock staff read" ON public.stock_movements
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "stock staff insert" ON public.stock_movements
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.apply_stock_movement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_qty integer;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN
    RAISE EXCEPTION 'Only hospital staff can change medicine stock';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.medicines WHERE id = NEW.medicine_id) THEN
    RAISE EXCEPTION 'Unknown medicine';
  END IF;
  UPDATE public.medicines SET quantity = quantity + NEW.change WHERE id = NEW.medicine_id
    RETURNING quantity INTO new_qty;
  IF new_qty < 0 THEN
    RAISE EXCEPTION 'Not enough stock: this move would take the quantity below zero';
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.apply_stock_movement() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER stock_movement_apply BEFORE INSERT ON public.stock_movements
  FOR EACH ROW EXECUTE FUNCTION public.apply_stock_movement();

-- Low-stock and expiry alerts, fired only when a threshold is crossed so staff are not spammed.
CREATE OR REPLACE FUNCTION public.notify_pharmacy_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  was_low boolean;
  is_low boolean;
  was_expiring boolean;
  is_expiring boolean;
BEGIN
  was_low := (TG_OP = 'UPDATE') AND (OLD.quantity <= OLD.low_stock_threshold);
  is_low := NEW.quantity <= NEW.low_stock_threshold;
  was_expiring := (TG_OP = 'UPDATE') AND (OLD.expiry_date IS NOT NULL AND OLD.expiry_date <= CURRENT_DATE + 30);
  is_expiring := NEW.expiry_date IS NOT NULL AND NEW.expiry_date <= CURRENT_DATE + 30;

  IF is_low AND NOT was_low THEN
    PERFORM public.notify_users(public.staff_user_ids(), 'Low medicine stock',
      NEW.medicine_name || ' is down to ' || NEW.quantity || ' left in stock', 'pharmacy', '/dashboard/admin');
  END IF;
  IF is_expiring AND NOT was_expiring THEN
    PERFORM public.notify_users(public.staff_user_ids(), 'Medicine expiring soon',
      NEW.medicine_name || ' (batch ' || COALESCE(NEW.batch_number, 'n/a') || ') expires on ' || to_char(NEW.expiry_date, 'DD/MM/YYYY'), 'pharmacy', '/dashboard/admin');
  END IF;
  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.notify_pharmacy_alerts() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER pharmacy_alerts AFTER INSERT OR UPDATE ON public.medicines
  FOR EACH ROW EXECUTE FUNCTION public.notify_pharmacy_alerts();