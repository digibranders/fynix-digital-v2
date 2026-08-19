import { describe, it, expect, vi, beforeEach } from "vitest";

// The registrant helpers talk to Zoom through `zoomRequest`; mock that so these
// tests exercise our branching (batch response → GET fallback) without a network.
// `vi.hoisted` keeps the spy available inside the hoisted `vi.mock` factory.
const { zoomRequest } = vi.hoisted(() => ({ zoomRequest: vi.fn() }));
vi.mock("@/lib/zoom/client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/zoom/client")>(
    "@/lib/zoom/client"
  );
  return { ...actual, zoomRequest };
});

import { registerAttendee } from "./registrants";
import { ZoomApiError } from "./client";

const WEBINAR = "89815830266";
const ATTENDEE = { name: "Gaurav Jadhav", email: "gaurav@fynix.digital" };

beforeEach(() => {
  zoomRequest.mockReset();
});

describe("registerAttendee", () => {
  it("returns the join link straight from the batch response when present", async () => {
    zoomRequest.mockResolvedValueOnce({
      registrants: [
        {
          registrant_id: "RN_batch",
          email: ATTENDEE.email,
          join_url: "https://us06web.zoom.us/w/1?tk=batch",
        },
      ],
    });

    const result = await registerAttendee(WEBINAR, ATTENDEE);

    expect(result).toEqual({
      registrantId: "RN_batch",
      joinUrl: "https://us06web.zoom.us/w/1?tk=batch",
    });
    expect(zoomRequest).toHaveBeenCalledTimes(1);
  });

  it("recovers the join link from the registrant list when the batch echoes none", async () => {
    // Batch accepts the (already-known) registrant but returns no join_url — the
    // exact shape that stranded a paid seat in production.
    zoomRequest.mockResolvedValueOnce({ registrants: [{ email: ATTENDEE.email }] });
    // GET /registrants?status=approved carries the real link, keyed as `id`.
    zoomRequest.mockResolvedValueOnce({
      registrants: [
        { id: "RN_other", email: "someone@else.com", join_url: "https://x/other" },
        { id: "RN_gaurav", email: "GAURAV@fynix.digital", join_url: "https://x/gaurav" },
      ],
    });

    const result = await registerAttendee(WEBINAR, ATTENDEE);

    expect(result).toEqual({
      registrantId: "RN_gaurav",
      joinUrl: "https://x/gaurav",
    });
    // Second call is the read-only list lookup (does not spend a daily attempt).
    expect(zoomRequest).toHaveBeenCalledTimes(2);
    expect(zoomRequest.mock.calls[1][0]).toBe(`/webinars/${WEBINAR}/registrants`);
    expect(zoomRequest.mock.calls[1][1]).toMatchObject({
      query: expect.objectContaining({ status: "approved" }),
    });
  });

  it("follows pagination when the registrant is on a later page", async () => {
    zoomRequest.mockResolvedValueOnce({ registrants: [{ email: ATTENDEE.email }] });
    zoomRequest.mockResolvedValueOnce({
      registrants: [{ id: "RN_x", email: "x@x.com", join_url: "https://x/x" }],
      next_page_token: "PAGE2",
    });
    zoomRequest.mockResolvedValueOnce({
      registrants: [{ id: "RN_gaurav", email: ATTENDEE.email, join_url: "https://x/g" }],
    });

    const result = await registerAttendee(WEBINAR, ATTENDEE);

    expect(result.registrantId).toBe("RN_gaurav");
    expect(zoomRequest.mock.calls[2][1]).toMatchObject({
      query: expect.objectContaining({ next_page_token: "PAGE2" }),
    });
  });

  it("throws only when neither the batch nor the list yields a link", async () => {
    zoomRequest.mockResolvedValueOnce({ registrants: [{ email: ATTENDEE.email }] });
    zoomRequest.mockResolvedValueOnce({ registrants: [] });

    await expect(registerAttendee(WEBINAR, ATTENDEE)).rejects.toBeInstanceOf(
      ZoomApiError
    );
  });
});
