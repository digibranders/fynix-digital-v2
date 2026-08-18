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

/**
 * A file to send with the email. `contentBase64` is the raw file bytes in
 * base64, which is the form Brevo's API takes. Brevo caps the total attachment
 * payload at roughly 10MB; a workshop invoice is a few KB, so that is not a
 * practical limit here.
 */
export type EmailAttachment = {
  /** Filename shown to the recipient, e.g. "FYX-26-27-0001.pdf". */
  name: string;
  contentBase64: string;
};

export type SendTransactionalEmailParams = {
  to: EmailAddress[];
  sender: EmailAddress;
  subject: string;
  htmlContent: string;
  textContent: string;
  replyTo?: EmailAddress;
  attachments?: EmailAttachment[];
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
    const attached = params.attachments?.length
      ? ` with ${params.attachments.map((a) => a.name).join(", ")}`
      : "";
    console.log(
      `[EMAIL:DISABLED] would send subject="${params.subject}" to=${params.to
        .map((r) => r.email)
        .join(", ")}${attached} (EMAILS_ENABLED is off — nothing sent)`
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
      // Brevo expects `attachment: [{ content, name }]`; omit the key entirely
      // when there is nothing to attach.
      ...(params.attachments?.length
        ? {
            attachment: params.attachments.map((file) => ({
              content: file.contentBase64,
              name: file.name,
            })),
          }
        : {}),
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
