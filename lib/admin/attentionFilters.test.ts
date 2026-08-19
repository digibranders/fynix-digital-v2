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
  // An abandoned checkout. Has no join link either, and has burned Zoom
  // attempts, but is not a problem: nobody paid for it.
  testRow({
    ref: "E",
    status: "pending",
    hasJoinLink: false,
    zoomAccessAttempts: 3,
  }),
  // Paid, invoiced, no link, and out of Zoom attempts. Will not recover on its
  // own, so it is both "no join link" and "stuck".
  testRow({
    ref: "F",
    status: "paid",
    invoiceNo: "FYX/4",
    hasJoinLink: false,
    zoomAccessAttempts: 3,
  }),
  // Charged and invoiced disagree: the worst thing this data can say.
  testRow({
    ref: "G",
    status: "paid",
    invoiceNo: "FYX/5",
    hasJoinLink: true,
    amountCharged: 884900,
    invoiceTotal: 749900,
  }),
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
    expect(totals.joinLinksMissing).toBe(2);
    expect(matching("joinLinksMissing")).toEqual(["C", "F"]);
  });

  it("opens exactly the seats counted as out of Zoom attempts", () => {
    // A strict subset of the seats with no join link: C is mid-flight and may
    // still get one, F has burned its quota. E is unpaid and counts for
    // neither, however many attempts it made.
    expect(totals.zoomAccessStuck).toBe(1);
    expect(matching("zoomAccessStuck")).toEqual(["F"]);
  });

  it("opens exactly the seats counted as charged-not-equal-invoiced", () => {
    expect(totals.amountsMismatched).toBe(1);
    expect(matching("amountsMismatched")).toEqual(["G"]);
  });

  it("keeps stuck seats inside the join-link figure rather than beside it", () => {
    // If these ever stop overlapping, one of the two predicates has drifted and
    // the overview is double-counting a seat it should report once.
    const stuck = matching("zoomAccessStuck");
    const missing = matching("joinLinksMissing");
    expect(stuck.every((ref) => missing.includes(ref))).toBe(true);
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
    expect(filters.amountCheck).toBe("any");
    expect(filters.zoomAccess).toBe("any");
  });
});
