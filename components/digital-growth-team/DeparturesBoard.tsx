"use client";

import { useEffect, useRef, type ReactElement } from "react";
import type { BoardRow } from "@/lib/digital-growth-team";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** Time between letters while a cell spins, and between status changes. */
const SPIN_MS = 70;
const CYCLE_MS = 3200;
/** A cell squashes and brightens for a moment each time its letter changes, like a flap falling. */
const FLAP: Keyframe[] = [{ transform: "scaleY(1)" }, { transform: "scaleY(0.15)", filter: "brightness(1.7)" }, { transform: "scaleY(1)" }];

type CellKind = "channel" | "status";

const CELL =
  "relative grid h-7 w-4 place-items-center overflow-hidden rounded-[3px] bg-[linear-gradient(var(--primary-hover)_0_50%,color-mix(in_srgb,var(--primary-hover)_78%,black)_50%_100%)] text-sm font-semibold after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/60 sm:h-8 sm:w-[22px] sm:text-[17px] xl:h-10 xl:w-[26px] xl:text-xl";

/** One word in fixed-width cells, padded with blanks to the widest word in its column. */
function Cells({ kind, text, width }: { readonly kind: CellKind; readonly text: string; readonly width: number }): ReactElement {
  return (
    <span className="flex gap-0.5 sm:gap-[3px]">
      {Array.from(text.padEnd(width, " "), (char, index) => (
        <span key={index} data-cell={kind} className={`${CELL} ${kind === "status" ? "text-accent" : "text-white"}`}>
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * A split-flap departures board: each channel the team runs, and a status that flips through its words. The server
 * renders every row at its first status, so the board reads correctly without JavaScript or with reduced motion; once
 * mounted, every letter spins into place and the status column flips on a cycle.
 */
export default function DeparturesBoard({
  rows,
  columns,
  note,
  summary,
}: {
  readonly rows: readonly BoardRow[];
  readonly columns: readonly [string, string];
  readonly note: string;
  readonly summary: string;
}): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const channelWidth = Math.max(...rows.map((row) => row.channel.length));
  const statusWidth = Math.max(...rows.flatMap((row) => row.statuses.map((status) => status.length)));

  useEffect(() => {
    const root = rootRef.current;
    if (root === null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers = new Set<number>();
    const later = (run: () => void, ms: number): void => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        run();
      }, ms);
      timers.add(id);
    };
    const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-board-row]"), (line) => ({
      channel: Array.from(line.querySelectorAll<HTMLElement>('[data-cell="channel"]')),
      status: Array.from(line.querySelectorAll<HTMLElement>('[data-cell="status"]')),
    }));

    /** Spins each cell through a few random letters before it lands on its letter of `text`. */
    const flipTo = (cells: readonly HTMLElement[], text: string, delay: number, always: boolean): void => {
      const padded = text.padEnd(cells.length, " ");
      cells.forEach((cell, index) => {
        const target = padded.charAt(index);
        if (!always && cell.textContent === target) return;
        let spins = 4 + Math.floor(Math.random() * 6);
        const tick = (): void => {
          cell.animate(FLAP, { duration: 90 });
          cell.textContent = spins > 0 ? LETTERS.charAt(Math.floor(Math.random() * LETTERS.length)) : target;
          spins -= 1;
          if (spins >= 0) later(tick, SPIN_MS);
        };
        later(tick, delay + index * 40);
      });
    };

    rows.forEach((row, index) => {
      const line = lines[index];
      if (line === undefined) return;
      flipTo(line.channel, row.channel, 200 + index * 300, true);
      flipTo(line.status, row.statuses[0], 700 + index * 300, true);
    });

    let step = 0;
    const cycle = window.setInterval(() => {
      step += 1;
      rows.forEach((row, index) => {
        const line = lines[index];
        if (line === undefined) return;
        flipTo(line.status, row.statuses[step % row.statuses.length] ?? row.statuses[0], index * 250, false);
      });
    }, CYCLE_MS);

    return () => {
      window.clearInterval(cycle);
      for (const id of timers) window.clearTimeout(id);
    };
  }, [rows]);

  return (
    <div className="w-fit max-w-full rounded-xl bg-[color-mix(in_srgb,var(--primary)_72%,black)] p-3 shadow-[0_30px_50px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 sm:p-4 xl:p-5">
      <p className="sr-only">{summary}</p>
      <div ref={rootRef} aria-hidden className="grid grid-cols-[auto_auto] gap-x-2 gap-y-1.5 sm:gap-x-2.5">
        {columns.map((column) => (
          <span key={column} className="mb-1.5 text-[10px] tracking-[0.16em] text-accent uppercase sm:text-[11px]">
            {column}
          </span>
        ))}
        {rows.map((row) => (
          <div key={row.channel} data-board-row className="contents">
            <Cells kind="channel" text={row.channel} width={channelWidth} />
            <Cells kind="status" text={row.statuses[0]} width={statusWidth} />
          </div>
        ))}
      </div>
      <p aria-hidden className="mt-3 text-xs text-white/50">
        {note}
      </p>
    </div>
  );
}
