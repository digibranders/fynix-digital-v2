import { describe, expect, it } from "vitest";
import { formatDate, readingLabel } from "@/lib/cms/format";

describe("formatDate", () => {
  it("formats in UTC so server and browser agree", () => {
    expect(formatDate("2026-03-01T23:30:00.000Z")).toBe("1 March 2026");
    expect(formatDate("2026-12-31T00:00:00.000Z")).toBe("31 December 2026");
  });
});

describe("readingLabel", () => {
  it("never says zero minutes", () => {
    expect(readingLabel(0)).toBe("1 min read");
    expect(readingLabel(6)).toBe("6 min read");
  });
});
