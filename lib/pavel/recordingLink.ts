/**
 * Reading a Zoom recording share out of whatever the operator pasted.
 *
 * Zoom's "Copy shareable link" does not put a bare URL on the clipboard. It
 * puts a block:
 *
 *   Topic: Semantic SEO Masterclass
 *   Start Time: Aug 19, 2026 04:00 PM
 *
 *   Meeting Recording:
 *   https://us06web.zoom.us/rec/share/6e5BPugdt77z5Blra…
 *
 *   Access Passcode: Fynix#300
 *
 * Pasting that into a field that expects a URL used to fail validation, so the
 * only way through was to cut the passcode out by hand and paste it again into
 * the second box. The link and its passcode arrive together and belong
 * together; splitting them is this module's job, not the operator's.
 */

/**
 * The first http(s) URL in the text.
 *
 * Deliberately not anchored: the URL sits in the middle of Zoom's block, on its
 * own line, under a "Meeting Recording:" heading.
 */
const URL_PATTERN = /https?:\/\/[^\s<>"']+/i;

/**
 * A labelled passcode.
 *
 * Zoom writes "Access Passcode:" in the share block and "Passcode:" in the
 * email it sends; "password" is what its older copy used and what people still
 * type. The label is required — an unlabelled token on a line of its own is
 * just as likely to be a topic or a date, and guessing wrong would store a
 * passcode that sends every buyer to a prompt they cannot answer.
 */
const PASSCODE_PATTERN = /(?:access\s+)?pass\s*(?:code|word)\s*[:：]\s*(\S+)/i;

/** Sentence punctuation that a URL at the end of a line collects. */
const TRAILING_PUNCTUATION = /[.,;:!?)\]}>'"]+$/;

export type ParsedRecordingPaste = {
  url: string | null;
  passcode: string | null;
};

/** Pull the share URL and, when it is labelled, the passcode out of a paste. */
export function parseRecordingPaste(raw: string): ParsedRecordingPaste {
  const text = (raw ?? "").trim();
  if (!text) return { url: null, passcode: null };

  const urlMatch = URL_PATTERN.exec(text);
  const passcodeMatch = PASSCODE_PATTERN.exec(text);

  let url: string | null = null;
  if (urlMatch) {
    let candidate = urlMatch[0];

    // A single-line input strips the newlines out of anything pasted into it,
    // so without JavaScript the block arrives as one run of text and the label
    // ends up welded to the end of the link:
    //
    //   …46ATpXCFBJKANO9KAccess Passcode: Fynix#300
    //
    // The URL then swallows the label, and what gets stored is a dead link
    // that looks close enough to a real one to pass a glance. Cut it back to
    // where the label starts.
    if (passcodeMatch) {
      const labelStart = passcodeMatch.index - urlMatch.index;
      if (labelStart > 0 && labelStart < candidate.length) {
        candidate = candidate.slice(0, labelStart);
      }
    }

    url = candidate.replace(TRAILING_PUNCTUATION, "") || null;
  }

  return { url, passcode: passcodeMatch ? passcodeMatch[1] : null };
}

/**
 * A passcode field's value, with a label stripped if one came along.
 *
 * Someone who copies "Passcode: Fynix#300" into the passcode box means the
 * code, not the sentence. Storing the label would be printed verbatim in every
 * buyer's email.
 */
export function normalizePasscode(raw: string): string | null {
  const text = (raw ?? "").trim();
  if (!text) return null;
  const match = PASSCODE_PATTERN.exec(text);
  return match ? match[1] : text;
}

export type ResolvedRecordingInput =
  | { ok: true; url: string | null; passcode: string | null }
  | { ok: false; error: string };

/**
 * What to store, given both fields as the operator left them.
 *
 * Shared by the console's server action and the droplet's admin API so the two
 * cannot drift into disagreeing about the same paste.
 *
 * When the pasted block carries a passcode it wins over whatever sits in the
 * passcode box. The two arrived together and describe the same recording,
 * whereas the box may still hold the previous session's code — and a stale
 * passcode silently attached to a fresh link is exactly the failure this whole
 * module exists to prevent.
 */
export function resolveRecordingInput(
  rawUrl: string,
  rawPasscode: string
): ResolvedRecordingInput {
  const trimmed = (rawUrl ?? "").trim();

  // Clearing the link clears the passcode with it: a code left behind would be
  // printed against the next recording published here.
  if (!trimmed) return { ok: true, url: null, passcode: null };

  const parsed = parseRecordingPaste(trimmed);
  if (!parsed.url) {
    return {
      ok: false,
      error:
        "That does not look like a link. Paste the Zoom share URL, or clear the field to remove it.",
    };
  }

  return {
    ok: true,
    url: parsed.url,
    passcode: parsed.passcode ?? normalizePasscode(rawPasscode),
  };
}
