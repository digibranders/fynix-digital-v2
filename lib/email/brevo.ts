const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

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
