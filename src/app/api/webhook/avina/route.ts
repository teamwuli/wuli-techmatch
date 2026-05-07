import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface AvinaWebhookPayload {
  // Signal info
  signal_type?: string;
  signal_name?: string;
  signal_description?: string;
  confidence_score?: number;

  // Company info
  company_name?: string;
  company_domain?: string;
  company_size?: string;
  employee_count?: number;
  industry?: string;
  location?: string;

  // Contact info
  contact_name?: string;
  contact_email?: string;
  contact_title?: string;
  contact_linkedin?: string;
  contact_phone?: string;

  // Metadata
  avina_id?: string;
  timestamp?: string;
  [key: string]: unknown;
}

function mapEmployeeCountToTier(count: number): string {
  if (count <= 50) return "1-50";
  if (count <= 200) return "51-200";
  if (count <= 500) return "201-500";
  if (count <= 2000) return "501-2000";
  if (count <= 5000) return "2001-5000";
  return "5000+";
}

function mapCompanySizeToTier(companySize: string): string {
  const size = companySize.toLowerCase().replace(/[,\s]/g, "");
  if (size.includes("1-50") || size.includes("1–50")) return "1-50";
  if (size.includes("51-200") || size.includes("51–200")) return "51-200";
  if (size.includes("201-500") || size.includes("201–500")) return "201-500";
  if (size.includes("501-2000") || size.includes("501–2000") || size.includes("501-2,000")) return "501-2000";
  if (size.includes("2001-5000") || size.includes("2001–5000") || size.includes("2,001")) return "2001-5000";
  if (size.includes("5000") || size.includes("5,000")) return "5000+";
  const num = parseInt(size.replace(/\D/g, ""), 10);
  if (!isNaN(num)) return mapEmployeeCountToTier(num);
  return "51-200";
}

function getSizeTier(payload: AvinaWebhookPayload): string {
  if (payload.employee_count) return mapEmployeeCountToTier(payload.employee_count);
  if (payload.company_size) return mapCompanySizeToTier(payload.company_size);
  return "51-200";
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.AVINA_WEBHOOK_SECRET;
    if (webhookSecret) {
      const authHeader = req.headers.get("authorization") || req.headers.get("x-webhook-secret");
      if (authHeader !== `Bearer ${webhookSecret}` && authHeader !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload: AvinaWebhookPayload = await req.json();
    const companyName = payload.company_name || "Unknown Company";
    const sizeTier = getSizeTier(payload);

    // Fetch benchmarks for this company size
    const { data: benchmarks } = await supabase
      .from("pricing_benchmarks")
      .select("category, size_tier, price_low, price_high, unit, volume_driver, typical_savings_pct_low, typical_savings_pct_high, replaces, notes")
      .eq("size_tier", sizeTier);

    // Build benchmark summary for Avina's AI SDR variables
    const benchmarkSummary = (benchmarks || []).map((b) => ({
      category: b.category,
      price_range: `$${b.price_low}-${b.price_high}${b.unit}`,
      typical_savings_pct: b.typical_savings_pct_low && b.typical_savings_pct_high
        ? `${b.typical_savings_pct_low}-${b.typical_savings_pct_high}%`
        : null,
      replaces: b.replaces,
    }));

    // Find top matching providers via semantic search if we have signal context
    const signalContext = payload.signal_name || payload.signal_type || "";
    let matchedProviders: { name: string; category: string; similarity: number }[] = [];

    if (signalContext) {
      const { data: providers } = await supabase.rpc("match_providers", {
        query_text: signalContext,
        match_threshold: 0.3,
        match_count: 5,
      });
      if (providers) {
        matchedProviders = providers.map((p: { name: string; category: string; similarity: number }) => ({
          name: p.name,
          category: p.category,
          similarity: p.similarity,
        }));
      }
    }

    // Estimate overspend based on benchmarks
    const employeeCount = payload.employee_count || estimateEmployeeCount(sizeTier);
    const overspendEstimate = calculateOverspendEstimate(benchmarks || [], employeeCount);

    // Save to leads table
    const { data: lead } = await supabase.from("leads").insert([{
      company_name: companyName,
      company_size: payload.company_size || sizeTier,
      industry: payload.industry || "",
      signal_type: payload.signal_type || payload.signal_name || "avina_signal",
      pain_point: payload.signal_description || signalContext || "",
      matched_providers: matchedProviders.length > 0 ? matchedProviders : null,
      meeting_booked: false,
    }]).select("id").single();

    // Save contact if provided
    if (payload.contact_email && lead?.id) {
      await supabase.from("contacts").upsert({
        email: payload.contact_email,
        name: payload.contact_name || "",
        title: payload.contact_title || "",
        company: companyName,
        lead_id: lead.id,
        source: "avina",
      }, { onConflict: "email" });
    }

    // Log event
    if (lead?.id) {
      await supabase.from("events").insert({
        lead_id: lead.id,
        contact_id: null,
        event_type: "avina_signal_received",
        metadata: {
          signal_type: payload.signal_type,
          signal_name: payload.signal_name,
          company_name: companyName,
          avina_id: payload.avina_id,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Return data for Avina's AI SDR to use as email variables
    return NextResponse.json({
      success: true,
      lead_id: lead?.id,
      company: companyName,
      size_tier: sizeTier,
      employee_estimate: employeeCount,
      matched_providers: matchedProviders.slice(0, 3).map((p) => p.name),
      top_category: matchedProviders[0]?.category || benchmarkSummary[0]?.category || "IT Services",
      overspend_estimate: overspendEstimate.total,
      savings_range: overspendEstimate.savingsRange,
      savings_timeline: "6-12 months",
      benchmark_data: benchmarkSummary.slice(0, 5),
    });
  } catch (error) {
    console.error("Avina webhook error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// Health check for Avina to verify webhook is active
export async function GET() {
  return NextResponse.json({ status: "active", service: "techmatch-avina-webhook" });
}

function estimateEmployeeCount(sizeTier: string): number {
  const estimates: Record<string, number> = {
    "1-50": 25,
    "51-200": 125,
    "201-500": 350,
    "501-2000": 1000,
    "2001-5000": 3500,
    "5000+": 7500,
  };
  return estimates[sizeTier] || 125;
}

function calculateOverspendEstimate(
  benchmarks: { category: string; price_high: number; unit: string; typical_savings_pct_low: number | null; typical_savings_pct_high: number | null }[],
  employeeCount: number
): { total: string; savingsRange: string } {
  if (benchmarks.length === 0) {
    const baseSpend = employeeCount * 35 * 12; // ~$35/user/mo avg IT spend
    const savingsLow = Math.round(baseSpend * 0.15);
    const savingsHigh = Math.round(baseSpend * 0.30);
    return {
      total: `$${Math.round(baseSpend).toLocaleString()}/year`,
      savingsRange: `$${savingsLow.toLocaleString()}-${savingsHigh.toLocaleString()}/year`,
    };
  }

  // Use top benchmark categories to estimate
  const topCategories = benchmarks.slice(0, 3);
  let totalHighSpend = 0;
  let totalSavingsLow = 0;
  let totalSavingsHigh = 0;

  for (const b of topCategories) {
    const annualSpend = b.price_high * employeeCount * 12;
    totalHighSpend += annualSpend;
    totalSavingsLow += annualSpend * ((b.typical_savings_pct_low || 15) / 100);
    totalSavingsHigh += annualSpend * ((b.typical_savings_pct_high || 30) / 100);
  }

  return {
    total: `$${Math.round(totalHighSpend).toLocaleString()}/year`,
    savingsRange: `$${Math.round(totalSavingsLow).toLocaleString()}-${Math.round(totalSavingsHigh).toLocaleString()}/year`,
  };
}
