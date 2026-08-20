import { describe, expect, it } from "vitest";
import { paymentFailureMessage } from "@/lib/pavel/paymentFailure";

/**
 * The real payload this was written for: an India-issued Mastercard refused
 * against a USD order. Razorpay recorded it as a gateway BAD_REQUEST_ERROR at
 * authorization, and the overlay showed the SRC internals rather than a reason.
 */
const INDIAN_CARD_IN_USD = {
  error: {
    code: "BAD_REQUEST_ERROR",
    description:
      "DPA entity data not found for the given clientId or dpaId in getDpaEntityData request.",
    source: "gateway",
    step: "payment_authorization",
  },
};

const RETRY = "Payment failed or was cancelled. You can try again.";

describe("paymentFailureMessage", () => {
  it("names the fix when a dollar order is declined at authorization", () => {
    const message = paymentFailureMessage(INDIAN_CARD_IN_USD, "USD");
    expect(message).toContain(RETRY);
    expect(message).toContain("cannot be charged in dollars");
    expect(message).toContain("Set your country to India");
  });

  it("never relays the gateway's internal text", () => {
    const message = paymentFailureMessage(INDIAN_CARD_IN_USD, "USD");
    expect(message).not.toContain("DPA");
    expect(message).not.toContain("getDpaEntityData");
  });

  it("leaves a rupee checkout alone: the currency is already right", () => {
    expect(paymentFailureMessage(INDIAN_CARD_IN_USD, "INR")).toBe(RETRY);
  });

  it("stays generic when the buyer, not the gateway, ended the payment", () => {
    const dismissed = {
      error: { code: "BAD_REQUEST_ERROR", source: "customer", step: "payment_initiation" },
    };
    expect(paymentFailureMessage(dismissed, "USD")).toBe(RETRY);
  });

  it("survives a payload carrying nothing", () => {
    expect(paymentFailureMessage(undefined, "USD")).toBe(RETRY);
    expect(paymentFailureMessage({}, "USD")).toBe(RETRY);
    expect(paymentFailureMessage({ error: {} }, undefined)).toBe(RETRY);
  });
});
