import { describe, expect, it } from "vitest";
import { prepareBody } from "@/lib/cms/body";

describe("prepareBody", () => {
  it("lifts the body's h1 out when the body supplies it", () => {
    const out = prepareBody('<h1 id="t">Title</h1><p>Text</p>', "body");
    expect(out.heading).toEqual({ kind: "html", html: '<h1 id="t">Title</h1>' });
    expect(out.html).toBe("<p>Text</p>");
  });

  it("lifts an h1 that is not first and leaves the rest in order", () => {
    const out = prepareBody('<p>Lead</p><h1 id="t">Title</h1><p>Text</p>', "body");
    expect(out.heading).toEqual({ kind: "html", html: '<h1 id="t">Title</h1>' });
    expect(out.html).toBe("<p>Lead</p><p>Text</p>");
  });

  it("demotes a second h1 so the page keeps exactly one", () => {
    const out = prepareBody('<h1 id="a">A</h1><h1 id="b">B</h1>', "body");
    expect(out.html).toBe('<h2 id="b">B</h2>');
    expect(out.html).not.toContain("<h1");
  });

  it("renders the title as the h1 when the body has none", () => {
    expect(prepareBody("<p>Text</p>", "title")).toEqual({ heading: { kind: "title" }, html: "<p>Text</p>" });
  });

  it("demotes a stray h1 when the title is the heading", () => {
    expect(prepareBody('<h1 id="x">X</h1>', "title").html).toBe('<h2 id="x">X</h2>');
  });

  it("falls back to the title when the body promised an h1 but has none", () => {
    expect(prepareBody("<p>Text</p>", "body").heading).toEqual({ kind: "title" });
  });

  it("never mistakes escaped text for a tag", () => {
    expect(prepareBody("<p>&lt;h1&gt; is a tag</p>", "title").html).toBe("<p>&lt;h1&gt; is a tag</p>");
  });
});
