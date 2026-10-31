# Professional Upgrade – LifeCare HMS (from uploaded brief)

Scope taken from `Complete_Professional_Upgrade_-_Hospital_pasted.md` (file truncated at §7 Pharmacy; §1–§7 implemented).

## Tasks
- [x] Audit existing schema, RLS policies, constraints (done: policies OK; missing double-booking guard, no EMR tables, medicines lacks batch/category/low-stock)
- [ ] DB phase 1: appointment double-booking guard (partial unique index + live availability check fn)
- [ ] DB phase 2: EMR tables (clinical_notes, vitals, patient_history) + RLS + audit triggers
- [ ] DB phase 3: pharmacy upgrade (medicines columns, stock_movements, dispense fn, low-stock/expiry notifications)
- [ ] Regenerate types.ts
- [ ] Booking page: live slot availability from DB
- [ ] Doctor dashboard: EMR tab (notes, vitals, diagnosis, follow-up, patient history)
- [ ] Patient dashboard: medical records tab (history, allergies, vitals, notes, follow-ups)
- [ ] Admin dashboard: upgraded Pharmacy module (batch/category/threshold, stock movements, low-stock alerts)
- [ ] Verify flows end-to-end with demo accounts
