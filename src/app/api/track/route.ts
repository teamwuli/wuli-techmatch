import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact_id");
  const leadId = searchParams.get("lead_id");
  const to = searchParams.get("to");

  // Always redirect — tracking is best-effort
  const destination = to ? decodeURIComponent(to) : "/analyze";

  try {
    if (contactId) {
      await supabase.from("events").insert({
        contact_id: contactId,
        lead_id: leadId || null,
        event_type: "link_clicked",
        metadata: {
          destination,
          user_agent: request.headers.get("user-agent"),
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (err) {
    console.error("Tracking error (non-fatal):", err);
  }

  return NextResponse.redirect(destination, { status: 301 });
}
