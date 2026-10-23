import { describe, expect, it } from "vitest";
import { isAuthorized, parseRevalidateBody } from "@/lib/cms/revalidate";

describe("isAuthorized", () => {
  it("accepts only the exact bearer secret", () => {
    expect(isAuthorized("Bearer s3cret", "s3cret")).toBe(true);
    expect(isAuthorized("Bearer s3cret ", "s3cret")).toBe(false);
    expect(isAuthorized("Bearer other", "s3cret")).toBe(false);
    expect(isAuthorized("s3cret", "s3cret")).toBe(false);
    expect(isAuthorized("Basic s3cret", "s3cret")).toBe(false);
    expect(isAuthorized(null, "s3cret")).toBe(false);
  });

  it("fails closed when no secret is configured", () => {
    expect(isAuthorized("Bearer ", undefined)).toBe(false);
    expect(isAuthorized("Bearer ", "")).toBe(false);
  });
});

describe("parseRevalidateBody", () => {
  it("treats an empty body as revalidate everything", () => {
    expect(parseRevalidateBody("")).toEqual({ ok: true, paths: [] });
    expect(parseRevalidateBody("  \n")).toEqual({ ok: true, paths: [] });
    expect(parseRevalidateBody("{}")).toEqual({ ok: true, paths: [] });
  });

  it("reads and de-duplicates post paths", () => {
    expect(parseRevalidateBody('{"paths":["/blog/a","/blog/a","/resources/b"]}')).toEqual({
      ok: true,
      paths: ["/blog/a", "/resources/b"],
    });
  });

  it("rejects malformed JSON, wrong shapes and addresses the CMS cannot issue", () => {
    expect(parseRevalidateBody("{").ok).toBe(false);
    expect(parseRevalidateBody('{"paths":"/blog/a"}').ok).toBe(false);
    expect(parseRevalidateBody('{"paths":["blog/a"]}').ok).toBe(false);
    expect(parseRevalidateBody('{"paths":["/Blog/A"]}').ok).toBe(false);
    expect(parseRevalidateBody('{"paths":[1]}').ok).toBe(false);
    const many = JSON.stringify({ paths: Array.from({ length: 51 }, (_, i) => `/blog/p-${i}`) });
    expect(parseRevalidateBody(many).ok).toBe(false);
  });
});
