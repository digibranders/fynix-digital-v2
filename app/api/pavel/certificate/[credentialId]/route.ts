import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { getCertificateByCredentialId } from "@/lib/pavel/certificate";
import { clientKey, rateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Reads per client per window. The credential id is the capability, so bulk
 *  enumeration must stay impractical; a shared certificate page reads once. */
const LIMIT = 30;
const WINDOW_MS = 60_000;

/**
 * Public read for an issued certificate.
 *
 * The certificate page is served from the marketing site, which has no database,
 * so it reads the credential through here. Deliberately public and unauthenticated:
 * a certificate exists to be shared with employers and verified by them, and the
 * credential id is random rather than sequential precisely so the set cannot be
 * enumerated.
 *
 * Only the three fields the certificate prints are returned. Nothing about the
 * buyer's payment, email or attendance leaks through a shareable link.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ credentialId: string }> }
) {
  const limit = rateLimit(`pavel-cert:${clientKey(request)}`, LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { credentialId } = await params;

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Unavailable." }, { status: 503 });
  }

  const certificate = await getCertificateByCredentialId(db, credentialId);
  if (!certificate) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({
    credentialId: certificate.credentialId,
    recipientName: certificate.recipientName,
    issueDateLabel: certificate.issueDateLabel,
  });
}
