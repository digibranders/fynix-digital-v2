import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { verifyProxySecret } from "@/lib/admin/gateway";
import {
  findInvoiceRegistration,
  renderInvoiceDownload,
} from "@/lib/pavel/invoiceDownload";

export const runtime = "nodejs";
// Streams a per-buyer document; must never be cached or statically rendered.
export const dynamic = "force-dynamic";

/**
 * Internal: serve a registration's tax invoice to the admin console.
 *
 * Called server-to-server by the console with the shared secret, never by a
 * browser. The operator's login is checked on the console side; the secret is
 * what authenticates the caller here. A wrong or missing secret gets a bare
 * 404, identical to an unknown ref.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  if (!verifyProxySecret(request)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { ref } = await params;

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "Database is not configured on this host." },
      { status: 503 }
    );
  }

  const registration = await findInvoiceRegistration(db, ref);
  if (!registration) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return renderInvoiceDownload(db, ref, registration);
}
