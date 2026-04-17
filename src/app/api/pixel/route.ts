import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 1x1 transparent PNG pixel
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get("contact_id");
  const seq = searchParams.get("seq") || "1";

  // Best-effort tracking — always return the pixel
  try {
    if (contactId) {
      await supabase.from("events").insert({
        contact_id: contactId,
        event_type: "email_opened",
        metadata: {
          sequence_number: parseInt(seq),
          user_agent: request.headers.get("user-agent"),
          timestamp: new Date().toISOString(),
        },
      });
    }
  } catch (err) {
    console.error("Pixel tracking error (non-fatal):", err);
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
