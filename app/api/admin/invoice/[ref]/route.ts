import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminGatewayError, adminGatewayFetch } from "@/lib/admin/gateway";
import {
  findInvoiceRegistration,
  renderInvoiceDownload,
} from "@/lib/pavel/invoiceDownload";

export const runtime = "nodejs";
// Streams a per-buyer document; must never be cached or statically rendered.
export const dynamic = "force-dynamic";

/**
 * Download a registration's tax invoice from the admin console.
 *
 * Same-origin with the dashboard, so the operator's session cookie authorises
 * it. Where the database is reachable the PDF is rendered here; on Vercel it is
 * streamed back from the droplet through the internal admin API.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ref: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { ref } = await params;
  const db = getDb();

  if (db) {
    const registration = await findInvoiceRegistration(db, ref);
    if (!registration) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return renderInvoiceDownload(db, ref, registration);
  }

  try {
    const upstream = await adminGatewayFetch(
      `/api/admin/data/invoice/${encodeURIComponent(ref)}`
    );

    // Pass the document (or the upstream error) through untouched, keeping the
    // headers that make the browser render it as a PDF.
    const headers = new Headers();
    for (const header of [
      "content-type",
      "content-disposition",
      "content-length",
    ]) {
      const value = upstream.headers.get(header);
      if (value) headers.set(header, value);
    }
    headers.set("Cache-Control", "private, no-store");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    if (error instanceof AdminGatewayError) {
      console.error("[admin/invoice] gateway is not configured", error);
      return NextResponse.json(
        { error: "The admin console is not connected to its data service." },
        { status: 503 }
      );
    }
    console.error("[admin/invoice] gateway request failed", error);
    return NextResponse.json(
      { error: "Could not reach the invoice service." },
      { status: 502 }
    );
  }
}
