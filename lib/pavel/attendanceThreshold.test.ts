import { describe, expect, it } from "vitest";
import { readThreshold } from "@/lib/pavel/certificate";

/**
 * This value decides who gets a certificate, so every way of misconfiguring it
 * has to land on the safe side rather than on zero.
 */
describe("readThreshold", () => {
  it("uses a configured value", () => {
    expect(readThreshold("5")).toBe(5);
    expect(readThreshold("90")).toBe(90);
    expect(readThreshold(" 45 ")).toBe(45);
  });

  it("falls back to 90 for an EMPTY string", () => {
    // The one that matters. The deploy writes the line whether or not the
    // variable is set, so unset arrives as "" — and Number("") is 0, which
    // would certify everyone who registered, including people who never joined.
    expect(readThreshold("")).toBe(90);
    expect(readThreshold("   ")).toBe(90);
  });

  it.each([undefined, "abc", "0", "-10", "NaN", "Infinity"])(
    "falls back to 90 for %s",
    (value) => {
      expect(readThreshold(value as string | undefined)).toBe(90);
    }
  );
});
