import { describe, it, expect } from "vitest";
import { amountInWords } from "./amountInWords";

/**
 * Indian tax invoices state the total in words. INR uses the Indian numbering
 * system (thousand, lakh, crore); USD uses the short scale (thousand, million).
 */

describe("INR (Indian numbering)", () => {
  it("writes the full workshop price", () => {
    // ₹8,848.82
    expect(amountInWords(884882, "INR")).toBe(
      "Rupees Eight Thousand Eight Hundred Forty Eight and Eighty Two Paise Only"
    );
  });

  it("writes a discounted total", () => {
    // ₹7,963.94
    expect(amountInWords(796394, "INR")).toBe(
      "Rupees Seven Thousand Nine Hundred Sixty Three and Ninety Four Paise Only"
    );
  });

  it("omits the paise clause for a whole rupee amount", () => {
    expect(amountInWords(749900, "INR")).toBe(
      "Rupees Seven Thousand Four Hundred Ninety Nine Only"
    );
  });

  it("uses lakh and crore rather than the short scale", () => {
    expect(amountInWords(10000000, "INR")).toBe("Rupees One Lakh Only");
    expect(amountInWords(1000000000, "INR")).toBe("Rupees One Crore Only");
    expect(amountInWords(12345600, "INR")).toBe(
      "Rupees One Lakh Twenty Three Thousand Four Hundred Fifty Six Only"
    );
  });

  it("handles zero", () => {
    expect(amountInWords(0, "INR")).toBe("Rupees Zero Only");
  });

  it("handles teens and tens correctly", () => {
    expect(amountInWords(1100, "INR")).toBe("Rupees Eleven Only");
    expect(amountInWords(1500, "INR")).toBe("Rupees Fifteen Only");
    expect(amountInWords(2000, "INR")).toBe("Rupees Twenty Only");
    expect(amountInWords(9000, "INR")).toBe("Rupees Ninety Only");
  });

  it("writes paise below ten with the right tens word", () => {
    expect(amountInWords(100005, "INR")).toBe("Rupees One Thousand and Five Paise Only");
  });
});

describe("USD (short scale)", () => {
  it("writes the workshop price", () => {
    expect(amountInWords(9900, "USD")).toBe("US Dollars Ninety Nine Only");
  });

  it("includes cents when present", () => {
    expect(amountInWords(11682, "USD")).toBe(
      "US Dollars One Hundred Sixteen and Eighty Two Cents Only"
    );
  });

  it("uses million rather than lakh", () => {
    expect(amountInWords(100000000, "USD")).toBe("US Dollars One Million Only");
  });
});

describe("guards", () => {
  it("rejects a non-integer minor amount", () => {
    expect(() => amountInWords(123.4, "INR")).toThrow(/integer/i);
  });

  it("rejects a negative amount", () => {
    expect(() => amountInWords(-100, "INR")).toThrow();
  });
});
