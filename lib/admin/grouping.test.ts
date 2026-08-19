import { describe, it, expect } from "vitest";
import { buildGroups } from "./grouping";
import { testRow as row } from "@/lib/admin/testRow";

describe("buildGroups", () => {
  it("collapses every attempt for one email into a single group", () => {
    const rows = [
      row({ ref: "A", email: "gaurav@fynix.digital", createdAt: "2026-08-19T04:31:00Z" }),
      row({ ref: "B", email: "gaurav@fynix.digital", createdAt: "2026-08-18T20:19:00Z" }),
      row({ ref: "C", email: "someone@else.com", createdAt: "2026-08-18T18:00:00Z" }),
    ];

    const groups = buildGroups(rows);

    expect(groups).toHaveLength(2);
    const gaurav = groups.find((g) => g.email === "gaurav@fynix.digital");
    expect(gaurav?.attempts).toHaveLength(2);
    // Attempts are newest-first.
    expect(gaurav?.attempts.map((a) => a.ref)).toEqual(["A", "B"]);
  });

  it("keys the group on a normalised email (case + surrounding space)", () => {
    const rows = [
      row({ ref: "A", email: "Gaurav@Fynix.Digital" }),
      row({ ref: "B", email: "  gaurav@fynix.digital " }),
    ];

    expect(buildGroups(rows)).toHaveLength(1);
  });

  it("lets the paid seat represent the group even when it is not the newest attempt", () => {
    const rows = [
      // A newer pending retry after paying — must not become the representative.
      row({ ref: "PENDING_NEW", email: "x@x.com", status: "pending", createdAt: "2026-08-19T05:00:00Z" }),
      row({
        ref: "PAID",
        email: "x@x.com",
        status: "paid",
        createdAt: "2026-08-18T20:00:00Z",
        paidAt: "2026-08-18T20:01:00Z",
      }),
    ];

    const [group] = buildGroups(rows);

    expect(group.hasPaid).toBe(true);
    expect(group.representative.ref).toBe("PAID");
  });

  it("picks the most recent paid seat when a buyer somehow paid twice", () => {
    const rows = [
      row({ ref: "PAID_OLD", email: "x@x.com", status: "paid", paidAt: "2026-08-18T20:00:00Z" }),
      row({ ref: "PAID_NEW", email: "x@x.com", status: "paid", paidAt: "2026-08-18T21:00:00Z" }),
    ];

    expect(buildGroups(rows)[0].representative.ref).toBe("PAID_NEW");
  });

  it("uses the newest attempt as representative when nothing is paid", () => {
    const rows = [
      row({ ref: "OLD", email: "x@x.com", createdAt: "2026-08-18T10:00:00Z" }),
      row({ ref: "NEW", email: "x@x.com", createdAt: "2026-08-19T10:00:00Z" }),
    ];

    const [group] = buildGroups(rows);
    expect(group.hasPaid).toBe(false);
    expect(group.representative.ref).toBe("NEW");
  });

  it("orders groups by most recent activity, paid time included", () => {
    const rows = [
      row({ ref: "OLD", email: "old@x.com", createdAt: "2026-08-17T10:00:00Z" }),
      row({
        ref: "PAID",
        email: "recent@x.com",
        status: "paid",
        createdAt: "2026-08-18T09:00:00Z",
        paidAt: "2026-08-19T09:00:00Z",
      }),
    ];

    expect(buildGroups(rows).map((g) => g.email)).toEqual([
      "recent@x.com",
      "old@x.com",
    ]);
  });
});

