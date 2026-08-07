import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Option = { value: string; label: string };

type LooseClient = {
  from: (table: string) => {
    select: (columns: string) => {
      order: (column: string, opts: { ascending: boolean }) => PromiseLike<{ data: Record<string, unknown>[] | null }>;
    };
  };
};
const db = supabase as unknown as LooseClient;

/** Loads `{ value, label }` options from any table for use in a select field. */
export function useLookup(table: string, labelKey: string, valueKey = "id"): Option[] {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    let alive = true;
    void db.from(table).select(`${valueKey}, ${labelKey}`).order(labelKey, { ascending: true }).then(({ data }) => {
      if (!alive) return;
      setOptions((data ?? []).map((r) => ({ value: String(r[valueKey]), label: String(r[labelKey] ?? "") })));
    });
    return () => { alive = false; };
  }, [table, labelKey, valueKey]);
  return options;
}

/** Maps an id to its label, for rendering foreign keys in tables. */
export function labelFor(options: Option[], id: unknown): string {
  return options.find((o) => o.value === String(id ?? ""))?.label ?? "—";
}