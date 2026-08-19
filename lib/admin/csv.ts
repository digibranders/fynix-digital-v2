import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";

/**
 * CSV serialisation for the registrations export.
 *
 * Extracted from the dashboard component so it can be tested without a DOM and
 * so a redesign of the table cannot quietly change the file an operator
 * downloads. The dashboard still owns the download itself (blob, filename); it
 * is only the bytes that live here.
 */

/** The shape `buildCsv` needs from a column. */
export type CsvColumn = {
  label: string;
  csv: (row: AdminRegistrationRow) => string | number | null;
};

/** RFC-4180 cell: wrap in quotes only when the value contains a delimiter. */
export function csvCell(value: string | number | null): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Serialise rows to CSV.
 *
 * Walks EVERY column it is handed, not the visible ones. The screen is a
 * working view the operator narrows to stay sane; the export is the record, and
 * a column hidden for readability going missing from the file is how an export
 * quietly stops answering the question it was taken for.
 *
 * Row order is the caller's: the export follows the canonical filtered order,
 * never the operator's chosen sort, so the file is reproducible.
 */
export function buildCsv(
  rows: AdminRegistrationRow[],
  columns: readonly CsvColumn[]
): string {
  const headers = ["S.No", ...columns.map((c) => c.label)];
  const lines = [headers.map(csvCell).join(",")];
  rows.forEach((row, index) => {
    const cells = [index + 1, ...columns.map((c) => c.csv(row))];
    lines.push(cells.map(csvCell).join(","));
  });
  // CRLF line endings per RFC 4180; the reader (Excel, Sheets) normalises them.
  return lines.join("\r\n");
}
