import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { company_name, company_size, industry, pain_points } = await req.json();

    const searchText = `${industry} company with ${company_size} employees named ${company_name}. Key challenges: ${pain_points.join(", ")}. Looking for technology solutions to address these pain points.`;

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: searchText,
    });

    const embedding = embeddingResponse.data[0].embedding;

    const { data: results, error } = await supabase.rpc("match_providers", {
      query_embedding: embedding,
      match_count: 5,
    });

    if (error) {
      console.error("Supabase match error:", error);
      return NextResponse.json(
        { providers: [], error: "Provider matching temporarily unavailable" },
        { status: 200 }
      );
    }

    return NextResponse.json({ providers: results || [] });
  } catch (error) {
    console.error("Match API error:", error);
    return NextResponse.json(
      { providers: [], error: "Match service error" },
      { status: 200 }
    );
  }
}
