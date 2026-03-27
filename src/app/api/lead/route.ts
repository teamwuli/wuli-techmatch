import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const leadData: Record<string, unknown> = {
      company_name: body.company_name || "",
      company_size: body.company_size || "",
      industry: body.industry || "",
      pain_point: Array.isArray(body.pain_points) ? body.pain_points.join(", ") : (body.pain_point || ""),
      signal_type: body.trigger || body.signal_type || "",
      matched_providers: body.matched_providers || null,
      business_case: body.business_case || null,
      comparison_report: body.comparison_report || null,
      meeting_booked: false,
    };

    if (body.contact_id) {
      leadData.contact_id = body.contact_id;
    }

    const { data, error } = await supabase.from("leads").insert([leadData]).select("id").single();

    if (error) {
      console.error("Lead save error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log analyzer_completed event
    if (data?.id) {
      try {
        await supabase.from("events").insert({
          lead_id: data.id,
          contact_id: body.contact_id || null,
          event_type: "analyzer_completed",
          metadata: {
            company_name: body.company_name,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (e) {
        console.error("Event log error:", e);
      }
    }

    return NextResponse.json({ success: true, lead_id: data?.id });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing lead ID" }, { status: 400 });
    }

    const { error } = await supabase.from("leads").update(updates).eq("id", id);

    if (error) {
      console.error("Lead update error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead PATCH error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
