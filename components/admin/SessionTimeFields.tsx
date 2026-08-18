"use client";

import { useState } from "react";
import { DateTimeField } from "@/components/admin/DateTimeField";

/**
 * The start and end pair for a new session.
 *
 * They are held together rather than as two independent fields because they are
 * not independent: the panel requires both or neither, the end is always the
 * same session as the start, and the workshop runs a fixed three hours. So
 * choosing a start proposes an end, and the end's calendar opens on the start's
 * month instead of today.
 *
 * The proposal only ever fills an empty end. Overwriting one the operator had
 * already set would quietly discard a deliberate choice.
 */

const WORKSHOP_HOURS = 3;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Add hours to a `YYYY-MM-DDTHH:mm` value, staying in wall-clock.
 *
 * `Date.UTC` is used purely as calendar arithmetic — it handles month and year
 * rollover — and the parts are read back with the UTC getters, so no local
 * offset is ever applied. See the note in DateTimeField: converting through
 * local time here is how a 5:00 PM IST session becomes 11:30.
 */
function addHours(value: string, hours: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return "";
  const [, y, mo, d, h, mi] = match.map(Number) as unknown as number[];
  const shifted = new Date(Date.UTC(y, mo - 1, d, h + hours, mi));
  return (
    `${shifted.getUTCFullYear()}-${pad(shifted.getUTCMonth() + 1)}-` +
    `${pad(shifted.getUTCDate())}T${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}`
  );
}

export function SessionTimeFields({
  initialStartsAt = "",
  initialEndsAt = "",
}: {
  /** Wall-clock IST seed values, so an existing schedule opens filled in. */
  initialStartsAt?: string;
  initialEndsAt?: string;
} = {}) {
  const [startsAt, setStartsAt] = useState(initialStartsAt);
  const [endsAt, setEndsAt] = useState(initialEndsAt);

  return (
    <>
      <DateTimeField
        name="startsAt"
        label="Starts (IST)"
        value={startsAt}
        onChange={(next) => {
          setStartsAt(next);
          if (next && !endsAt) setEndsAt(addHours(next, WORKSHOP_HOURS));
        }}
      />
      <DateTimeField
        name="endsAt"
        label="Ends (IST)"
        value={endsAt}
        onChange={setEndsAt}
        referenceValue={startsAt}
      />
    </>
  );
}
