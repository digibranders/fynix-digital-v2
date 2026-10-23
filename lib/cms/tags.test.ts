import { describe, expect, it } from "vitest";
import { CMS_TAG, postTag, tagsToRevalidate } from "@/lib/cms/tags";

describe("tagsToRevalidate", () => {
  it("drops everything when no paths are given", () => {
    expect(tagsToRevalidate([])).toEqual([CMS_TAG]);
  });

  it("covers each changed post and every list that can mention it", () => {
    const tags = tagsToRevalidate(["/blog/a", "/blog/b"]);
    expect(tags).toContain(postTag("/blog/a"));
    expect(tags).toContain(postTag("/blog/b"));
    expect(tags).toEqual(expect.arrayContaining(["cms:posts", "cms:categories", "cms:authors", "cms:sitemap", "cms:redirects"]));
  });
});
