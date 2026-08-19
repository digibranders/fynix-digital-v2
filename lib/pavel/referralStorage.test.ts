import { afterEach, describe, expect, it } from "vitest";
import {
  REFERRAL_STORAGE_KEY,
  clearReferral,
  currentReferral,
} from "@/lib/pavel/referralLink";

/**
 * The share link's precedence rules, exercised against a stubbed window.
 *
 * The suite runs in a node environment with no DOM, and these functions are
 * written to guard on `typeof window`, so a small stub tests the real branching
 * without pulling jsdom in for four functions.
 */

type Store = Map<string, string>;

/** Install a window with the given URL query and sessionStorage contents. */
function stubWindow(search: string, initial: Store = new Map(), blocked = false) {
  const storage = {
    getItem: (k: string) => {
      if (blocked) throw new Error("storage blocked");
      return initial.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (blocked) throw new Error("storage blocked");
      initial.set(k, v);
    },
    removeItem: (k: string) => {
      if (blocked) throw new Error("storage blocked");
      initial.delete(k);
    },
  };
  (globalThis as { window?: unknown }).window = {
    location: { search },
    sessionStorage: storage,
  };
  return initial;
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("currentReferral", () => {
  it("returns nothing when there is no window (server render)", () => {
    expect(currentReferral()).toBe("");
  });

  it("takes the code from the URL and remembers it", () => {
    const store = stubWindow("?ref=zzlink25");
    expect(currentReferral()).toBe("ZZLINK25");
    // Remembered so it survives a move between prerendered country variants.
    expect(store.get(REFERRAL_STORAGE_KEY)).toBe("ZZLINK25");
  });

  it("falls back to the remembered code once the URL no longer carries one", () => {
    stubWindow("", new Map([[REFERRAL_STORAGE_KEY, "STEVE10"]]));
    expect(currentReferral()).toBe("STEVE10");
  });

  it("lets a fresh link override the remembered code", () => {
    // Someone opening a second partner's link should get that partner's code.
    const store = stubWindow("?ref=gaurav20", new Map([[REFERRAL_STORAGE_KEY, "STEVE10"]]));
    expect(currentReferral()).toBe("GAURAV20");
    expect(store.get(REFERRAL_STORAGE_KEY)).toBe("GAURAV20");
  });

  it("normalises a remembered value that was stored unnormalised", () => {
    stubWindow("", new Map([[REFERRAL_STORAGE_KEY, " steve10 "]]));
    expect(currentReferral()).toBe("STEVE10");
  });

  it("returns nothing for junk in the URL rather than applying it", () => {
    stubWindow("?ref=%20%20");
    expect(currentReferral()).toBe("");
  });

  it("still applies the URL's code when storage is blocked", () => {
    // Private mode must not cost the partner the attribution.
    stubWindow("?ref=zzlink25", new Map(), true);
    expect(currentReferral()).toBe("ZZLINK25");
  });

  it("returns nothing, rather than throwing, when storage is blocked and the URL is bare", () => {
    stubWindow("", new Map(), true);
    expect(currentReferral()).toBe("");
  });
});

describe("clearReferral", () => {
  it("forgets the code, so the next buyer in the tab does not inherit it", () => {
    const store = stubWindow("", new Map([[REFERRAL_STORAGE_KEY, "STEVE10"]]));
    clearReferral();
    expect(store.has(REFERRAL_STORAGE_KEY)).toBe(false);
    expect(currentReferral()).toBe("");
  });

  it("is a no-op without a window", () => {
    expect(() => clearReferral()).not.toThrow();
  });

  it("does not throw when storage is blocked", () => {
    stubWindow("", new Map(), true);
    expect(() => clearReferral()).not.toThrow();
  });
});
