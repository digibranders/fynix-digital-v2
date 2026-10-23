import { describe, expect, it } from "vitest";
import {
  archivePageHref,
  paginate,
  parsePageSegments,
  safeRedirectTarget,
  toSitePath,
} from "@/lib/cms/paths";

describe("toSitePath", () => {
  it("joins segments into an absolute path", () => {
    expect(toSitePath(["blog", "my-post"])).toBe("/blog/my-post");
    expect(toSitePath(["resources", "a", "b-2"])).toBe("/resources/a/b-2");
  });

  it("refuses anything the CMS could not have issued", () => {
    expect(toSitePath([])).toBeNull();
    expect(toSitePath(["Blog", "post"])).toBeNull();
    expect(toSitePath(["blog", "my post"])).toBeNull();
    expect(toSitePath(["blog", ".."])).toBeNull();
    expect(toSitePath(["blog", "a", "b", "c", "d", "e"])).toBeNull();
    expect(toSitePath(["blog", "-x"])).toBeNull();
    expect(toSitePath(["wp-admin.php"])).toBeNull();
    expect(toSitePath(["a".repeat(130)])).toBeNull();
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, i) => i + 1);

  it("slices a page and reports the page count", () => {
    expect(paginate(items, 1, 12)).toEqual({ items: items.slice(0, 12), page: 1, totalPages: 3 });
    expect(paginate(items, 3, 12)).toEqual({ items: [25], page: 3, totalPages: 3 });
  });

  it("returns null past the last page", () => {
    expect(paginate(items, 4, 12)).toBeNull();
  });

  it("treats an empty list as one empty page", () => {
    expect(paginate([], 1, 12)).toEqual({ items: [], page: 1, totalPages: 1 });
    expect(paginate([], 2, 12)).toBeNull();
  });
});

describe("parsePageSegments", () => {
  it("reads no segments as the first page", () => {
    expect(parsePageSegments(undefined)).toEqual({ kind: "page", page: 1 });
    expect(parsePageSegments([])).toEqual({ kind: "page", page: 1 });
  });

  it("reads page/<n>", () => {
    expect(parsePageSegments(["page", "2"])).toEqual({ kind: "page", page: 2 });
  });

  it("sends page 1 back to the unnumbered address", () => {
    expect(parsePageSegments(["page", "1"])).toEqual({ kind: "first" });
  });

  it("rejects anything else", () => {
    expect(parsePageSegments(["page"])).toEqual({ kind: "invalid" });
    expect(parsePageSegments(["page", "0"])).toEqual({ kind: "invalid" });
    expect(parsePageSegments(["page", "02"])).toEqual({ kind: "invalid" });
    expect(parsePageSegments(["page", "x"])).toEqual({ kind: "invalid" });
    expect(parsePageSegments(["page", "2", "3"])).toEqual({ kind: "invalid" });
    expect(parsePageSegments(["other", "2"])).toEqual({ kind: "invalid" });
  });
});

describe("archivePageHref", () => {
  it("leaves the first page unnumbered", () => {
    expect(archivePageHref("/blog", 1)).toBe("/blog");
    expect(archivePageHref("/blog", 3)).toBe("/blog/page/3");
    expect(archivePageHref("/blog/category/seo", 2)).toBe("/blog/category/seo/page/2");
  });
});

describe("safeRedirectTarget", () => {
  it("accepts site paths and http(s) addresses", () => {
    expect(safeRedirectTarget("/blog/new", "/blog/old")).toBe("/blog/new");
    expect(safeRedirectTarget("https://www.fynix.digital/blog/new", "/blog/old")).toBe(
      "https://www.fynix.digital/blog/new",
    );
  });

  it("refuses protocol-relative, script and self targets", () => {
    expect(safeRedirectTarget("//evil.example", "/blog/old")).toBeNull();
    expect(safeRedirectTarget("javascript:alert(1)", "/blog/old")).toBeNull();
    expect(safeRedirectTarget("/blog/old", "/blog/old")).toBeNull();
    expect(safeRedirectTarget("", "/blog/old")).toBeNull();
  });
});
