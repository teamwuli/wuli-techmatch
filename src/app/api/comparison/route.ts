import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";

interface StrategicApproach {
  approach_name: string;
  description: string;
  fit_score: number;
  estimated_annual_cost: string;
  deployment_timeline: string;
  best_for: string;
  key_strengths: string[];
  relevant_technologies: string[];
  key_risk: string;
}

export async function POST(req: NextRequest) {
  try {
    const { company_name, company_size, industry, pain_points, matched_providers } = await req.json();

    const providerContext = matched_providers?.length
      ? `Matched providers for context: ${matched_providers.map((p: { name?: string; category?: string }) => `${p.name || "Unknown"} (${p.category || "General"})`).join(", ")}`
      : "No specific providers matched yet.";

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: `Generate 3-4 strategic approaches for this company's technology situation:

Company: ${company_name}
Size: ${company_size} employees
Industry: ${industry}
Pain Points: ${pain_points.join(", ")}
${providerContext}

Return ONLY a valid JSON array with this exact structure for each approach:
[
  {
    "approach_name": "Strategy Name",
    "description": "2-3 sentence description",
    "fit_score": 85,
    "estimated_annual_cost": "$XX,XXX - $XX,XXX",
    "deployment_timeline": "X-Y months",
    "best_for": "Description of ideal scenario",
    "key_strengths": ["strength 1", "strength 2", "strength 3"],
    "relevant_technologies": ["ZTNA", "SD-WAN", "SASE", "UCaaS"],
    "key_risk": "Primary risk or consideration"
  }
]`,
        },
      ],
      system: "You are a senior technology strategist. Generate 3-4 strategic approaches (NOT specific vendor names) for this company's situation. Each approach should be a different strategy, not a vendor recommendation. Focus on categories like 'Cloud-First Migration', 'Hybrid Optimization', 'Best-of-Breed Integration', 'Managed Services Consolidation', etc. For each approach, include a 'relevant_technologies' array listing the specific technology categories (NOT vendor names) that would be involved — e.g. ZTNA, CloudPC, SASE, SD-WAN, UCaaS, CCaaS, CPaaS, SIP Trunking, MPLS, DIA, MDR, XDR, SIEM, SOAR, EDR, SOC2, PCI, FFIEC, GRC, DLP, CASB, PAM, MFA, IaaS, DRaaS, BaaS, Colocation, Hyperscale Cloud, Public Cloud, VDI/DaaS, EMM/UEM, IAM, etc. Return ONLY valid JSON array, no markdown fences, no explanation.",
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    const cleaned = textContent.text.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
    const approaches: StrategicApproach[] = JSON.parse(cleaned);

    return NextResponse.json(approaches);
  } catch (error) {
    console.error("Comparison API error:", error);
    return NextResponse.json(
      { error: "Failed to generate comparison" },
      { status: 500 }
    );
  }
}
