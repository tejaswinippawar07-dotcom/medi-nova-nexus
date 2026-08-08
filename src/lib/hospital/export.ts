/** Client-side exports for hospital tables: CSV (opens in Excel) and a print-to-PDF sheet. */

export type ExportColumn = { key: string; label: string; format?: (row: Record<string, unknown>) => string };

const cell = (row: Record<string, unknown>, col: ExportColumn): string => {
  if (col.format) return col.format(row);
  const v = row[col.key];
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

const stamp = () => new Date().toISOString().slice(0, 10);

export function exportCsv(filename: string, columns: ExportColumn[], rows: Record<string, unknown>[]) {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => escape(c.label)).join(",")];
  for (const row of rows) lines.push(columns.map((c) => escape(cell(row, c))).join(","));
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${stamp()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const escapeHtml = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] ?? c);

/** Opens a print-ready sheet; the browser's print dialog saves it as PDF. */
export function exportPdf(title: string, columns: ExportColumn[], rows: Record<string, unknown>[]) {
  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${columns.map((c) => `<td>${escapeHtml(cell(r, c))}</td>`).join("")}</tr>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title>
  <style>
    *{font-family:ui-sans-serif,system-ui,sans-serif}
    body{margin:32px;color:#0f172a}
    h1{font-size:20px;margin:0}
    .meta{color:#64748b;font-size:12px;margin:4px 0 20px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left}
    th{background:#f1f5f9}
    footer{margin-top:24px;color:#64748b;font-size:10px}
  </style></head><body>
  <h1>LifeCare Hospital — ${escapeHtml(title)}</h1>
  <div class="meta">Shirpur, Dhule, Maharashtra · Generated ${new Date().toLocaleString("en-IN")} · ${rows.length} record(s)</div>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  <footer>Confidential — generated from the LifeCare Hospital Management System.</footer>
  <script>window.onload=()=>{window.print()}<\/script>
  </body></html>`;
  const w = window.open("", "_blank", "width=1024,height=768");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
}
