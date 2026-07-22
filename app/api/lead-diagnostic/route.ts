import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { actSlug, email, company, summary } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid business email address is required." },
        { status: 400 }
      );
    }

    // In production: dispatch email alert, trigger CRM webhook (HubSpot/Brevo/Slack), or store in database
    console.log(`[Lead Diagnostic Request] Act: ${actSlug} | Email: ${email} | Company: ${company || "N/A"} | Summary: ${summary}`);

    return NextResponse.json(
      {
        success: true,
        message: `Thank you. Our lead technical engineer will review your ${actSlug.toUpperCase()} diagnostic profile and deliver a personalized executive brief to ${email} within 4 hours.`,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error processing diagnostic request." },
      { status: 500 }
    );
  }
}
