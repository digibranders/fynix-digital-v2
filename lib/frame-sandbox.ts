/**
 * How a client's live homepage is sandboxed inside the viewer on /free-business-website/live/[slug].
 *
 * - "isolated": the page runs with an opaque origin, so it can't set cookies or use storage. Use it for any site whose
 *   scripts track visitors: framed with its own origin, such a site would set tracking cookies on everyone who opens ours.
 * - "own-origin": the page keeps its origin, so requests back to its own server work. Only for sites checked to set no
 *   cookies and load no trackers when framed.
 *
 * Neither mode lets the page navigate ours, open pop-ups or submit forms.
 */
export type FrameSandbox = "isolated" | "own-origin";

export function frameSandboxAttribute(mode: FrameSandbox): string {
  return mode === "own-origin" ? "allow-scripts allow-same-origin" : "allow-scripts";
}
