export type PostHeading = { readonly kind: "html"; readonly html: string } | { readonly kind: "title" };

export interface PreparedBody {
  /** What the page renders as its single h1. */
  readonly heading: PostHeading;
  /** The article HTML with no h1 left in it. */
  readonly html: string;
}

const H1 = /<h1[\s>][\s\S]*?<\/h1>/;

/**
 * Settles the page's one h1. The HTML is the CMS's closed grammar (escaped text, no nesting inside a heading), so
 * matching to the first `</h1>` is exact and a literal `<h1` can only be a real tag.
 *
 * - h1Source "body": the first h1 in the body becomes the page heading and is lifted out so the template can place
 *   it in the header. Any further h1 (the editor only gets a warning) is demoted to h2.
 * - h1Source "title": the template renders the title, and a stray h1 in the body is demoted to h2.
 * - h1Source "body" but no h1 present (a contract slip): fall back to the title so the page still has exactly one.
 */
export function prepareBody(html: string, h1Source: "body" | "title"): PreparedBody {
  if (h1Source === "title") return { heading: { kind: "title" }, html: demoteH1(html) };

  const match = H1.exec(html);
  if (match === null) return { heading: { kind: "title" }, html };
  const rest = html.slice(0, match.index) + html.slice(match.index + match[0].length);
  return { heading: { kind: "html", html: match[0] }, html: demoteH1(rest) };
}

function demoteH1(html: string): string {
  return html.replace(/<h1(?=[\s>])/g, "<h2").replace(/<\/h1>/g, "</h2>");
}
