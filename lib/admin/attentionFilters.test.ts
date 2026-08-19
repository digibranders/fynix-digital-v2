import { describe, expect, it } from "vitest";
import { attentionFilters } from "@/lib/admin/attentionFilters";
import { computeTotals } from "@/lib/admin/registrationTotals";
import { rowMatchesFilters } from "@/lib/admin/registrationFilters";
import { testRow } from "@/lib/admin/testRow";

/**
 * The point of these: a "needs attention" figure and the view it opens must
 * count the same rows. If they drift, the console reports a problem and then
 * refuses to show it.
 */

const now = new Date("2026-09-10T00:00:00.000Z");

const rows = [
  // Paid, invoiced, has a link, certificate issued: nothing to do.
  testRow({
    ref: "A",
    status: "paid",
    invoiceNo: "FYX/1",
    hasJoinLink: true,
    credentialId: "C1",
    certificateEarned: true,
  }),
  // Paid but never invoiced.
  testRow({ ref: "B", status: "paid", hasJoinLink: true }),
  // Paid, invoiced, but Zoom never issued a link.
  testRow({ ref: "C", status: "paid", invoiceNo: "FYX/2", hasJoinLink: false }),
  // Paid, earned a certificate, never issued one.
  testRow({
    ref: "D",
    status: "paid",
    invoiceNo: "FYX/3",
    hasJoinLink: true,
    certificateEarned: true,
  }),
  // An abandoned checkout. Has no join link either, but is not a problem:
  // nobody paid for it.
  testRow({ ref: "E", status: "pending", hasJoinLink: false }),
];

function matching(key: Parameters<typeof attentionFilters>[0]) {
  const filters = attentionFilters(key, "");
  return rows.filter((row) => rowMatchesFilters(row, filters, now)).map((r) => r.ref);
}

describe("attentionFilters", () => {
  const totals = computeTotals(rows);

  it("opens exactly the seats counted as missing an invoice", () => {
    expect(totals.invoicesMissing).toBe(1);
    expect(matching("invoicesMissing")).toEqual(["B"]);
  });

  it("opens exactly the PAID seats counted as missing a join link", () => {
    // E has no link either, but was never paid for, so neither the figure nor
    // the view may include it.
    expect(totals.joinLinksMissing).toBe(1);
    expect(matching("joinLinksMissing")).toEqual(["C"]);
  });

  it("opens exactly the seats counted as having earned an unissued certificate", () => {
    expect(totals.certificatesUnissued).toBe(1);
    expect(matching("certificatesUnissued")).toEqual(["D"]);
  });

  it("replaces the whole filter set, keeping only the search text", () => {
    const filters = attentionFilters("invoicesMissing", "jane");
    expect(filters.query).toBe("jane");
    expect(filters.status).toBe("all");
    expect(filters.certificate).toBe("any");
    expect(filters.joinLink).toBe("any");
  });
});
