import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

interface BusinessCase {
  executive_summary: string;
  cost_of_current_situation: string;
  potential_annual_savings: string;
  roi_timeline: string;
  key_benefits: string[];
  risk_of_inaction: string;
  key_insight: string;
}

export async function POST(req: NextRequest) {
  try {
    const { company_name, company_size, industry, pain_points, matched_providers } = await req.json();

    const providerContext = matched_providers?.length
      ? `Matched providers for context: ${matched_providers.map((p: { name?: string; category?: string }) => `${p.name || "Unknown"} (${p.category || "General"})`).join(", ")}`
      : "No specific providers matched yet.";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: `Generate a data-driven business case analysis for this company:

Company: ${company_name}
Size: ${company_size} employees
Industry: ${industry}
Pain Points: ${pain_points.join(", ")}
${providerContext}

Return ONLY valid JSON with this exact structure:
{
  "executive_summary": "2-3 sentence executive summary",
  "cost_of_current_situation": "$XXX,XXX/year estimate",
  "potential_annual_savings": "$XXX,XXX/year estimate",
  "roi_timeline": "X-Y months",
  "key_benefits": ["benefit 1", "benefit 2", "benefit 3", "benefit 4"],
  "risk_of_inaction": "1-2 sentence risk statement",
  "key_insight": "1-2 sentence key insight"
}`,
        },
      ],
      system: "You are a senior technology analyst at a top advisory firm. Generate a data-driven business case analysis. Use realistic benchmarks: UCaaS $25-45/user/month, SD-WAN $200-400/site/month, CCaaS $100-200/agent/month, Cloud migration 20-40% savings, Security tools $30-60/user/month. Be specific with dollar amounts. Return ONLY valid JSON, no markdown fences, no explanation.",
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    const cleaned = textContent.text.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
    const businessCase: BusinessCase = JSON.parse(cleaned);

    return NextResponse.json(businessCase);
  } catch (error) {
    console.error("Business case API error:", error);
    return NextResponse.json(
      { error: "Failed to generate business case" },
      { status: 500 }
    );
  }
}
