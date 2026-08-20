import { WORKSHOP } from "@/components/pavel/workshopDetails";

/**
 * Reading a WhatsApp group invite out of what an operator pasted.
 *
 * This link is mailed to every buyer and printed on the thank-you page, so a
 * wrong one is discovered by the cohort, not by us. The two mistakes worth
 * catching are pasting the public support number (`wa.me/91…`, which would send
 * a hundred buyers into a one-to-one chat) and pasting an in-app "share" line
 * with the URL buried in it.
 *
 * Shared by the console's server action and the droplet's admin API so the two
 * cannot disagree about the same paste.
 */

/** The first http(s) URL in the text, so a pasted share line still works. */
const URL_PATTERN = /https?:\/\/[^\s<>"']+/i;

/** Sentence punctuation a URL at the end of a line collects. */
const TRAILING_PUNCTUATION = /[.,;:!?)\]}>'"]+$/;

/** WhatsApp's own invite hosts. `chat.whatsapp.com/<code>` is what the app copies. */
const INVITE_HOSTS = new Set(["chat.whatsapp.com", "www.chat.whatsapp.com"]);

export type ResolvedWhatsappGroupInput =
  | { ok: true; url: string | null }
  | { ok: false; error: string };

/**
 * What to store, given the field as the operator left it.
 *
 * Empty clears the link, which puts the session back on the built-in fallback
 * rather than mailing buyers no community at all.
 */
export function resolveWhatsappGroupInput(
  raw: string
): ResolvedWhatsappGroupInput {
  const text = (raw ?? "").trim();
  if (!text) return { ok: true, url: null };

  const match = URL_PATTERN.exec(text);
  const candidate = match ? match[0].replace(TRAILING_PUNCTUATION, "") : "";
  if (!candidate) {
    return {
      ok: false,
      error:
        "That does not look like a link. Paste the group's invite URL, or clear the field to use the default.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, error: "That is not a valid link." };
  }

  // Host AND code. A bare `chat.whatsapp.com` passes a hostname test and opens
  // WhatsApp's own marketing page, which is what a truncated copy looks like;
  // the invite is the path.
  const host = parsed.hostname.toLowerCase();
  const code = parsed.pathname.replace(/^\/+|\/+$/g, "");
  if (!INVITE_HOSTS.has(host) || !code) {
    return {
      ok: false,
      // Named explicitly: the likely paste is the wa.me support line, and
      // "invalid link" would not tell anyone why a URL that opens fine was
      // refused.
      error:
        "That is not a group invite link. In WhatsApp, open the group, then Invite via link — it starts with chat.whatsapp.com.",
    };
  }

  if (parsed.protocol !== "https:") {
    // This link is mailed to every buyer of the cohort, so it is not the place
    // to hand out a plaintext URL when WhatsApp serves the same invite over
    // https.
    return { ok: false, error: "Use the https:// version of that link." };
  }

  return { ok: true, url: candidate };
}

/**
 * The invite to hand this cohort.
 *
 * The session's own link when one is set, otherwise the constant this used to
 * be. Every place that shows or sends the invite goes through here, so the
 * email and the thank-you page cannot offer different groups.
 */
export function whatsappGroupUrlFor(
  sessionUrl: string | null | undefined
): string {
  return sessionUrl?.trim() || WORKSHOP.whatsappGroupUrl;
}
