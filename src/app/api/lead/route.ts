import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const leadData = {
      company_name: body.company_name || "",
      company_size: body.company_size || "",
      industry: body.industry || "",
      pain_points: body.pain_points || [],
      free_text: body.free_text || "",
      trigger: body.trigger || "",
      matched_providers: body.matched_providers || [],
      business_case: body.business_case || null,
      comparison_report: body.comparison_report || [],
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("leads").insert([leadData]);

    if (error) {
      console.error("Lead save error:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lead API error:", error);
    return NextResponse.json({ success: true });
  }
}
