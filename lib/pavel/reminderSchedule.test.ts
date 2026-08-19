import { describe, expect, it } from "vitest";
import {
  dueReminderTypes,
  reminderWindowOpensAt,
} from "@/lib/pavel/schedule";
import type { WorkshopSchedule } from "@/lib/pavel/workshopSchedule";

/**
 * Reminder timing decides what lands in a paying customer's inbox, so the cases
 * that matter are the ones where a wrong answer is embarrassing: four emails at
 * once, or an email describing a lead time that has already passed.
 */
const schedule = {
  startUtc: "2026-09-05T11:30:00.000Z",
  endUtc: "2026-09-05T14:30:00.000Z",
} as WorkshopSchedule;

const at = (iso: string) => dueReminderTypes(new Date(iso), schedule);

describe("dueReminderTypes", () => {
  it("sends nothing before the first window opens", () => {
    expect(at("2026-08-01T00:00:00Z")).toEqual([]);
  });

  it.each([
    ["8 days out", "2026-08-28T11:30:00Z", []],
    ["6 days out", "2026-08-30T11:30:00Z", ["reminder_7d"]],
    ["2 days out", "2026-09-03T11:30:00Z", ["reminder_3d"]],
    ["5 hours out", "2026-09-05T06:30:00Z", ["reminder_1d"]],
    ["30 minutes out", "2026-09-05T11:00:00Z", ["reminder_1h"]],
  ])("returns only the tightest window: %s", (_label, when, expected) => {
    expect(at(when)).toEqual(expected);
  });

  it("never returns more than one pre-event reminder", () => {
    // The regression this exists for. Every window stays open until the start,
    // so a buyer who paid an hour before once received 7d, 3d, 1d and 1h
    // together — three of them announcing a lead time already gone.
    for (const when of [
      "2026-08-30T11:30:00Z",
      "2026-09-03T00:00:00Z",
      "2026-09-04T23:00:00Z",
      "2026-09-05T11:29:00Z",
    ]) {
      const due = at(when).filter((t) => t !== "post_event");
      expect(due.length).toBeLessThanOrEqual(1);
    }
  });

  it("stops reminding once the event has started", () => {
    expect(at("2026-09-05T12:00:00Z")).toEqual([]);
  });

  it("switches to post_event only after the end", () => {
    expect(at("2026-09-05T14:29:00Z")).toEqual([]);
    expect(at("2026-09-05T14:30:00Z")).toEqual(["post_event"]);
    expect(at("2026-09-06T09:00:00Z")).toEqual(["post_event"]);
  });

  it("gives an early buyer the full sequence, one at a time", () => {
    // Each window becomes the tightest in turn, so nothing is lost by only ever
    // returning one.
    expect(at("2026-08-30T11:30:00Z")).toEqual(["reminder_7d"]);
    expect(at("2026-09-03T11:30:00Z")).toEqual(["reminder_3d"]);
    expect(at("2026-09-04T11:30:00Z")).toEqual(["reminder_1d"]);
    expect(at("2026-09-05T11:00:00Z")).toEqual(["reminder_1h"]);
  });
});

describe("reminderWindowOpensAt", () => {
  it("returns the moment each reminder is meant to be sent", () => {
    expect(reminderWindowOpensAt("reminder_7d", schedule)?.toISOString()).toBe(
      "2026-08-29T11:30:00.000Z"
    );
    expect(reminderWindowOpensAt("reminder_1d", schedule)?.toISOString()).toBe(
      "2026-09-04T11:30:00.000Z"
    );
    expect(reminderWindowOpensAt("reminder_1h", schedule)?.toISOString()).toBe(
      "2026-09-05T10:30:00.000Z"
    );
  });

  it("returns null for post_event", () => {
    // Not a countdown: it goes to everyone holding a seat, whenever they bought.
    expect(reminderWindowOpensAt("post_event", schedule)).toBeNull();
  });

  it("is what stops a late buyer being told '1 day to go' an hour before", () => {
    // Someone registering at this moment is AFTER the 1-day window opened, so
    // they are excluded from it and receive the 1-hour reminder instead.
    const registeredAt = new Date("2026-09-05T10:16:00Z");
    const oneDayOpened = reminderWindowOpensAt("reminder_1d", schedule)!;
    const oneHourOpened = reminderWindowOpensAt("reminder_1h", schedule)!;
    expect(registeredAt > oneDayOpened).toBe(true);
    expect(registeredAt < oneHourOpened).toBe(true);
  });
});
