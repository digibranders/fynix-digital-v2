import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detail, summary } from "@/lib/cms/fixtures";
import {
  CmsError,
  getAllPosts,
  getPostByPath,
  getRedirect,
  getSitemapEntries,
  isCmsConfigured,
} from "@/lib/cms/client";

const fetchMock = vi.fn<typeof fetch>();

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("CMS_API_URL", "https://cms.example.com");
  vi.stubEnv("CMS_READ_TOKEN", "secret-token");
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("when the CMS is not configured", () => {
  it("returns empty results and never calls fetch", async () => {
    vi.stubEnv("CMS_API_URL", "");
    expect(isCmsConfigured()).toBe(false);
    expect(await getPostByPath("/blog/a")).toBeNull();
    expect(await getAllPosts()).toEqual([]);
    expect(await getRedirect("/old")).toBeNull();
    expect(await getSitemapEntries()).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("getPostByPath", () => {
  it("sends the bearer token, the path and cache tags", async () => {
    fetchMock.mockResolvedValue(json(detail));
    const post = await getPostByPath("/blog/semantic-seo");
    expect(post?.title).toBe(detail.title);

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe("https://cms.example.com/api/public/posts/by-path?path=%2Fblog%2Fsemantic-seo");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer secret-token");
    expect(init?.next).toMatchObject({ revalidate: 300, tags: ["cms", "cms:posts", "cms:post:/blog/semantic-seo"] });
  });

  it("is null for a 404", async () => {
    fetchMock.mockResolvedValue(json({ error: "not_found" }, 404));
    expect(await getPostByPath("/blog/missing")).toBeNull();
  });

  it("throws a CmsError carrying the status for other failures", async () => {
    fetchMock.mockResolvedValue(json({ error: "unauthorized" }, 401));
    await expect(getPostByPath("/blog/a")).rejects.toMatchObject({ name: "CmsError", status: 401 });
  });

  it("throws when the response breaks the contract", async () => {
    fetchMock.mockResolvedValue(json({ ...detail, h1Source: "elsewhere" }));
    await expect(getPostByPath("/blog/a")).rejects.toBeInstanceOf(CmsError);
  });

  it("throws on a network failure without leaking the token", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const error = await getPostByPath("/blog/a").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(CmsError);
    expect(String((error as Error).message)).not.toContain("secret-token");
  });
});

describe("getAllPosts", () => {
  it("follows the cursor until the list ends", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ posts: [summary], nextCursor: "abc" }))
      .mockResolvedValueOnce(json({ posts: [{ ...summary, path: "/blog/two" }], nextCursor: null }));
    const posts = await getAllPosts();
    expect(posts.map((p) => p.path)).toEqual(["/blog/semantic-seo", "/blog/two"]);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("limit=50");
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("cursor=abc");
  });
});

describe("getRedirect", () => {
  it("returns the target or null", async () => {
    fetchMock.mockResolvedValueOnce(json({ from: "/old", to: "/blog/new" }));
    expect(await getRedirect("/old")).toEqual({ from: "/old", to: "/blog/new" });
    fetchMock.mockResolvedValueOnce(json({ error: "not_found" }, 404));
    expect(await getRedirect("/none")).toBeNull();
  });
});
