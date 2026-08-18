import { describe, it, expect } from "vitest";
import {
  financialYearFor,
  financialYearShort,
  formatInvoiceNo,
  INVOICE_PREFIX,
} from "./invoiceNumber";

/**
 * The invoice series must be consecutive and unique within an Indian financial
 * year (1 April to 31 March). The year boundary is evaluated in IST, because the
 * seller files in India: a payment at 23:00 UTC on 31 March is already 1 April
 * in India and therefore belongs to the NEXT financial year.
 */

describe("financial year", () => {
  it("treats April as the start of a new financial year", () => {
    expect(financialYearFor(new Date("2026-04-01T06:00:00Z"))).toBe("2026-27");
  });

  it("treats March as the end of the previous financial year", () => {
    expect(financialYearFor(new Date("2026-03-31T06:00:00Z"))).toBe("2025-26");
  });

  it("places the September workshop in FY 2026-27", () => {
    expect(financialYearFor(new Date("2026-09-05T11:30:00Z"))).toBe("2026-27");
  });

  it("rolls the year over using IST, not UTC", () => {
    // 31 Mar 2026 20:00 UTC is 1 Apr 2026 01:30 IST, so this is FY 2026-27.
    // Computing in UTC would file it under 2025-26 and break the series.
    expect(financialYearFor(new Date("2026-03-31T20:00:00Z"))).toBe("2026-27");

    // 31 Mar 2026 18:00 UTC is 31 Mar 2026 23:30 IST, still FY 2025-26.
    expect(financialYearFor(new Date("2026-03-31T18:00:00Z"))).toBe("2025-26");
  });

  it("derives the two-digit short form used in the invoice number", () => {
    expect(financialYearShort("2026-27")).toBe("26-27");
    expect(financialYearShort("2029-30")).toBe("29-30");
  });
});

describe("invoice number format", () => {
  it("pads the sequence to four digits", () => {
    expect(formatInvoiceNo(INVOICE_PREFIX, "2026-27", 1)).toBe("FYX/26-27/0001");
    expect(formatInvoiceNo(INVOICE_PREFIX, "2026-27", 42)).toBe("FYX/26-27/0042");
    expect(formatInvoiceNo(INVOICE_PREFIX, "2026-27", 9999)).toBe("FYX/26-27/9999");
  });

  it("keeps growing past four digits rather than wrapping", () => {
    expect(formatInvoiceNo(INVOICE_PREFIX, "2026-27", 10000)).toBe(
      "FYX/26-27/10000"
    );
  });

  it("stays within the 16-character GST limit", () => {
    for (const seq of [1, 9999, 10000, 99999]) {
      expect(formatInvoiceNo(INVOICE_PREFIX, "2026-27", seq).length).toBeLessThanOrEqual(16);
    }
  });

  it("uses a series distinct from the OyeChats DB prefix", () => {
    expect(INVOICE_PREFIX).toBe("FYX");
    expect(INVOICE_PREFIX).not.toBe("DB");
  });

  it("rejects a non-positive sequence", () => {
    expect(() => formatInvoiceNo(INVOICE_PREFIX, "2026-27", 0)).toThrow();
    expect(() => formatInvoiceNo(INVOICE_PREFIX, "2026-27", -1)).toThrow();
  });
});
