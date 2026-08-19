import { describe, expect, it } from "vitest";
import { buildCsv, csvCell, type CsvColumn } from "@/lib/admin/csv";
import { REGISTRATION_COLUMNS } from "@/components/admin/registrationColumns";
import { testRow } from "@/lib/admin/testRow";
import type { AdminRegistrationRow } from "@/lib/admin/registrationRow";

/**
 * Characterisation tests for the export.
 *
 * The export is the record an operator reconciles against, so these lock the
 * bytes: the header row, the column set, the quoting rules and the line
 * endings. A redesign of the table must not move any of them.
 */

/**
 * Minimal RFC-4180 reader, so the assertions below check what a spreadsheet
 * would actually see rather than what splitting on a bare comma suggests.
 */
function parseCsv(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      record.push(field);
      field = "";
    } else if (char === "\r" && text[i + 1] === "\n") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
      i += 1;
    } else field += char;
  }
  record.push(field);
  records.push(record);
  return records;
}

describe("csvCell", () => {
  it("leaves plain values unquoted", () => {
    expect(csvCell("Guest")).toBe("Guest");
    expect(csvCell(7499)).toBe("7499");
  });

  it("renders null and undefined as empty", () => {
    expect(csvCell(null)).toBe("");
  });

  it("quotes values containing a comma, quote or newline", () => {
    expect(csvCell("Mumbai, Maharashtra")).toBe('"Mumbai, Maharashtra"');
    expect(csvCell('He said "hi"')).toBe('"He said ""hi"""');
    expect(csvCell("line one\nline two")).toBe('"line one\nline two"');
    expect(csvCell("line one\r\nline two")).toBe('"line one\r\nline two"');
  });

  it("does not quote a value that merely contains a semicolon or space", () => {
    expect(csvCell("a; b")).toBe("a; b");
  });
});

describe("buildCsv", () => {
  const columns: CsvColumn[] = [
    { label: "Name", csv: (r) => r.name },
    { label: "Email", csv: (r) => r.email },
    { label: "Amount", csv: (r) => (r.amountCharged === null ? "" : r.amountCharged / 100) },
  ];

  it("leads with S.No then the column labels", () => {
    const csv = buildCsv([], columns);
    expect(csv).toBe("S.No,Name,Email,Amount");
  });

  it("numbers rows from one, in the order given", () => {
    const rows = [
      testRow({ name: "First", email: "a@example.com" }),
      testRow({ name: "Second", email: "b@example.com" }),
    ];
    const lines = buildCsv(rows, columns).split("\r\n");
    expect(lines[1]).toBe("1,First,a@example.com,");
    expect(lines[2]).toBe("2,Second,b@example.com,");
  });

  it("separates rows with CRLF", () => {
    const csv = buildCsv([testRow()], columns);
    expect(csv.split("\r\n")).toHaveLength(2);
    // A bare LF would split the file differently for a strict reader.
    expect(csv.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("quotes a field whose value contains a comma", () => {
    const rows = [testRow({ name: "Doe, Jane" })];
    expect(buildCsv(rows, columns).split("\r\n")[1]).toBe(
      '1,"Doe, Jane",guest@example.com,'
    );
  });

  it("divides money out of minor units so a spreadsheet can sum it", () => {
    const rows = [testRow({ amountCharged: 749900 })];
    expect(buildCsv(rows, columns).split("\r\n")[1]).toContain(",7499");
  });
});

describe("the registration column set", () => {
  it("exports every column, and every column has a label and an accessor", () => {
    expect(REGISTRATION_COLUMNS.length).toBe(61);
    for (const column of REGISTRATION_COLUMNS) {
      expect(column.label.length).toBeGreaterThan(0);
      expect(typeof column.csv).toBe("function");
    }
  });

  it("has no duplicate keys or labels", () => {
    const keys = REGISTRATION_COLUMNS.map((c) => c.key);
    const labels = REGISTRATION_COLUMNS.map((c) => c.label);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("writes a full row without throwing, and produces one cell per column", () => {
    const row: AdminRegistrationRow = testRow({
      status: "paid",
      amountCharged: 749900,
      currency: "INR",
      paidAt: "2026-08-18T09:12:00.000Z",
      invoiceNo: "FYX/26-27/0001",
      taxableValue: 635508,
      totalTax: 114392,
      attendedMinutes: 142,
      attendanceSyncedAt: "2026-09-05T15:30:00.000Z",
      certificateEarned: true,
      credentialId: "CRED-1",
      emailTypes: ["confirmation", "reminder_1d"],
    });
    const records = parseCsv(buildCsv([row], REGISTRATION_COLUMNS));
    expect(records).toHaveLength(2);
    // Header and body must agree on width, or the file is unreadable.
    expect(records[0]).toHaveLength(REGISTRATION_COLUMNS.length + 1);
    expect(records[1]).toHaveLength(REGISTRATION_COLUMNS.length + 1);
    expect(records[1][0]).toBe("1");
  });

  it("quotes a label containing a comma so the header stays one field", () => {
    // "Cert. earned, unissued" is the one label with a delimiter in it.
    const header = parseCsv(buildCsv([], REGISTRATION_COLUMNS))[0];
    expect(header).toContain("Cert. earned, unissued");
    expect(header).toHaveLength(REGISTRATION_COLUMNS.length + 1);
  });

  it("formats timestamps as sortable IST, so a spreadsheet orders them correctly", () => {
    const row = testRow({ createdAt: "2026-08-18T09:12:00.000Z" });
    const registered = REGISTRATION_COLUMNS.find((c) => c.key === "createdAt");
    expect(registered?.csv(row)).toBe("2026-08-18 14:42 IST");
  });
});
