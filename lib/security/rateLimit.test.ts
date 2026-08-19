import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, rateLimit, resetRateLimits } from "@/lib/security/rateLimit";

const T0 = 1_000_000;

beforeEach(() => resetRateLimits());

describe("rateLimit", () => {
  it("allows up to the limit inside one window", () => {
    for (let i = 1; i <= 5; i++) {
      expect(rateLimit("a", 5, 60_000, T0).allowed).toBe(true);
    }
  });

  it("blocks the attempt past the limit", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000, T0);
    const blocked = rateLimit("a", 5, 60_000, T0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("keeps separate counters per key", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000, T0);
    // One caller exhausting their budget must not lock anyone else out.
    expect(rateLimit("b", 5, 60_000, T0).allowed).toBe(true);
  });

  it("opens a fresh window once the old one has passed", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000, T0);
    expect(rateLimit("a", 5, 60_000, T0).allowed).toBe(false);
    expect(rateLimit("a", 5, 60_000, T0 + 60_001).allowed).toBe(true);
  });

  it("counts down retryAfter as the window drains", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000, T0);
    const early = rateLimit("a", 5, 60_000, T0 + 1_000);
    const late = rateLimit("a", 5, 60_000, T0 + 50_000);
    expect(early.retryAfter).toBeGreaterThan(late.retryAfter);
  });

  it("never reports a retryAfter of zero while blocked", () => {
    for (let i = 0; i < 5; i++) rateLimit("a", 5, 60_000, T0);
    // A zero would tell a caller to retry immediately, which is still blocked.
    expect(rateLimit("a", 5, 60_000, T0 + 59_999).retryAfter).toBeGreaterThanOrEqual(1);
  });
});

describe("clientKey", () => {
  const req = (headers: Record<string, string>) =>
    new Request("https://example.com", { headers });

  it("takes the leftmost x-forwarded-for entry, which is the original client", () => {
    expect(clientKey(req({ "x-forwarded-for": "203.0.113.9, 70.41.3.18" }))).toBe(
      "203.0.113.9"
    );
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(req({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
  });

  it("degrades to a shared bucket rather than throwing", () => {
    expect(clientKey(req({}))).toBe("unknown");
  });
});
