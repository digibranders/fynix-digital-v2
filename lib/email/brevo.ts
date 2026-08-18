const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * GLOBAL email kill switch — the single lowest-level guard every outbound mail
 * flows through, so nothing is sent regardless of which route triggered it
 * (Pavel confirmations/reminders, the contact form, the SEO-audit forms, all of
 * them). While this is `false`, sendTransactionalEmail logs what it WOULD have
 * sent and returns without touching Brevo — no real person is mailed.
 *
 * Re-enabling delivery is a deliberate human decision: flip this to `true`.
 */
const EMAILS_ENABLED = true;

export type EmailAddress = {
  email: string;
  name?: string;
};

export type SendTransactionalEmailParams = {
  to: EmailAddress[];
  sender: EmailAddress;
  subject: string;
  htmlContent: string;
  textContent: string;
  replyTo?: EmailAddress;
};

export class BrevoSendError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "BrevoSendError";
  }
}

export async function sendTransactionalEmail(
  params: SendTransactionalEmailParams
): Promise<void> {
  // Kill switch: never reach Brevo while disabled. Log the intended send so the
  // flow stays observable, then no-op — callers see a normal success (void).
  if (!EMAILS_ENABLED) {
    console.log(
      `[EMAIL:DISABLED] would send subject="${params.subject}" to=${params.to
        .map((r) => r.email)
        .join(", ")} (EMAILS_ENABLED is off — nothing sent)`
    );
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new BrevoSendError("BREVO_API_KEY is not configured.", 500);
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: params.sender,
      to: params.to,
      replyTo: params.replyTo,
      subject: params.subject,
      htmlContent: params.htmlContent,
      textContent: params.textContent,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new BrevoSendError(
      `Brevo API responded with ${response.status}: ${errorBody}`,
      response.status
    );
  }
}
