import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "@/lib/admin/dbErrors";

/**
 * The shape Drizzle actually throws: the wrapper's message is the SQL that
 * failed, and the reason it failed is one level down on `cause`. Matching only
 * the top-level message is why this went unnoticed.
 */
function drizzleWrapped() {
  const cause = Object.assign(
    new Error('duplicate key value violates unique constraint "referral_codes_code_unique"'),
    { code: "23505" }
  );
  return Object.assign(new Error("Failed query: insert into referral_codes ..."), { cause });
}

describe("isUniqueViolation", () => {
  it("sees through Drizzle's wrapper to the constraint underneath", () => {
    expect(isUniqueViolation(drizzleWrapped())).toBe(true);
  });

  it("matches on the SQLSTATE alone, without any message text", () => {
    const cause = Object.assign(new Error("boom"), { code: "23505" });
    expect(isUniqueViolation(new Error("Failed query", { cause }))).toBe(true);
  });

  it("matches an unwrapped driver error", () => {
    expect(
      isUniqueViolation(new Error("duplicate key value violates unique constraint"))
    ).toBe(true);
  });

  it("does not fire on an unrelated failure", () => {
    expect(isUniqueViolation(new Error("connection terminated"))).toBe(false);
  });

  it("does not fire on a different constraint violation", () => {
    const cause = Object.assign(new Error("null value in column"), { code: "23502" });
    expect(isUniqueViolation(new Error("Failed query", { cause }))).toBe(false);
  });

  it("survives a non-error value", () => {
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("duplicate key")).toBe(false);
  });

  it("terminates on a cyclic cause chain", () => {
    const a: { cause?: unknown } = {};
    const b = { cause: a };
    a.cause = b;
    expect(isUniqueViolation(a)).toBe(false);
  });
});
