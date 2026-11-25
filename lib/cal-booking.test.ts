import { describe, expect, it } from "vitest";
import { isValidTimeZone, parseBookingInput, parseSlotsQuery } from "./cal-booking";

const NOW = Date.parse("2026-11-25T10:00:00Z");

function query(entries: Record<string, string>): URLSearchParams {
  return new URLSearchParams(entries);
}

describe("parseSlotsQuery", () => {
  const ok = { start: "2026-12-01", end: "2026-12-31", timeZone: "Asia/Kolkata" };

  it("accepts a valid month range", () => {
    expect(parseSlotsQuery(query(ok))).toEqual(ok);
  });

  it.each([
    ["missing start", { ...ok, start: "" }],
    ["bad date format", { ...ok, end: "31-12-2026" }],
    ["end before start", { ...ok, start: "2026-12-31", end: "2026-12-01" }],
    ["range over 62 days", { ...ok, end: "2027-03-01" }],
    ["unknown time zone", { ...ok, timeZone: "Mars/Olympus" }],
  ])("rejects %s", (_label, entries) => {
    expect(parseSlotsQuery(query(entries))).toBeNull();
  });
});

describe("parseBookingInput", () => {
  const ok = {
    start: "2026-11-26T09:00:00.000+05:30",
    name: "  Sarah Chen ",
    email: " sarah@northwind.com ",
    timeZone: "Asia/Kolkata",
  };

  it("trims and accepts a valid booking", () => {
    expect(parseBookingInput(ok, NOW)).toEqual({
      start: ok.start,
      name: "Sarah Chen",
      email: "sarah@northwind.com",
      timeZone: "Asia/Kolkata",
    });
  });

  it.each([
    ["a past start", { ...ok, start: "2026-11-24T09:00:00.000+05:30" }],
    ["an unparseable start", { ...ok, start: "tomorrow" }],
    ["an empty name", { ...ok, name: "   " }],
    ["a bad email", { ...ok, email: "not-an-email" }],
    ["a bad time zone", { ...ok, timeZone: "nowhere" }],
  ])("rejects %s", (_label, body) => {
    expect(parseBookingInput(body, NOW)).toBeNull();
  });

  it("rejects non-object bodies", () => {
    expect(parseBookingInput(null, NOW)).toBeNull();
    expect(parseBookingInput("x", NOW)).toBeNull();
  });
});

describe("isValidTimeZone", () => {
  it("recognises IANA zones only", () => {
    expect(isValidTimeZone("America/New_York")).toBe(true);
    expect(isValidTimeZone("")).toBe(false);
    expect(isValidTimeZone(42)).toBe(false);
  });
});
