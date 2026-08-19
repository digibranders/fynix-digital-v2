"use client";

import { useState } from "react";
import {
  normalizePasscode,
  parseRecordingPaste,
} from "@/lib/pavel/recordingLink";

/**
 * The recording link and its passcode.
 *
 * Held together because Zoom hands them over together: "Copy shareable link"
 * puts a block on the clipboard with the URL on one line and "Access Passcode:"
 * a few lines below. Pasting that into the link box fills both fields, so the
 * operator does not have to cut the passcode out and paste it again.
 *
 * The server parses the same paste through the same functions, so this is a
 * convenience rather than the guard: an operator with no JavaScript, or one who
 * pastes the block and saves before it is split, still gets the right values
 * stored.
 */
export function RecordingLinkFields({
  initialUrl = "",
  initialPasscode = "",
}: {
  initialUrl?: string;
  initialPasscode?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [passcode, setPasscode] = useState(initialPasscode);

  function handleUrlPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    const parsed = parseRecordingPaste(text);

    // Only intercept a paste that is actually a Zoom block. A bare URL, or a
    // fragment pasted over part of the field, keeps the browser's own
    // behaviour: replacing the whole value there would discard a selection the
    // operator made deliberately.
    if (!parsed.url || !parsed.passcode) return;

    event.preventDefault();
    setUrl(parsed.url);
    setPasscode(parsed.passcode);
  }

  function handlePasscodePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    const stripped = normalizePasscode(text);
    if (!stripped || stripped === text.trim()) return;

    event.preventDefault();
    setPasscode(stripped);
  }

  return (
    <>
      <label className="min-w-[240px] flex-1 text-xs text-text-muted">
        Recording link (Zoom share URL)
        <input
          name="recordingUrl"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onPaste={handleUrlPaste}
          placeholder="Paste Zoom's share block: link and passcode split themselves"
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-lg border border-border bg-console-surface px-3 py-2 text-xs text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
      </label>
      <label className="w-full min-w-[140px] text-xs text-text-muted sm:w-auto sm:flex-none">
        Passcode
        <input
          name="recordingPasscode"
          value={passcode}
          onChange={(event) => setPasscode(event.target.value)}
          onPaste={handlePasscodePaste}
          placeholder="Leave blank if none"
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-lg border border-border bg-console-surface px-3 py-2 font-mono text-xs text-primary placeholder:text-text-muted focus:border-primary focus:outline-none sm:w-[180px]"
        />
      </label>
    </>
  );
}
