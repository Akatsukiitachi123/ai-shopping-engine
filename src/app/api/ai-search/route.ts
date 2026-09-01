import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Fetch available products from Supabase
    const { data: allProducts, error } = await supabase
      .from("products")
      .select("*");

    if (error || !allProducts) {
      return NextResponse.json({ error: "Failed to load catalog" }, { status: 500 });
    }

    // 2. Ask Gemini to analyze user query and pick/rank relevant products
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an expert personal shopping assistant.
User Search Query: "${prompt}"

Here is the current product catalog (JSON format):
${JSON.stringify(allProducts)}

Task:
1. Understand user style, category, or budget requirements.
2. Return ONLY a valid JSON array of product IDs from the catalog that match the intent best.
3. If multiple items fit together (e.g. an outfit or bundle), order them accordingly.

Output format (Strict JSON only, no markdown, no explanation):
["id-1", "id-2"]
      `,
    });

    const text = response.text || "[]";
    const cleanedText = text.replace(/```json|```/g, "").trim();
    const matchedIds: string[] = JSON.parse(cleanedText);

    // 3. Return matched items in ordered sequence
    const matchedProducts = matchedIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      results: matchedProducts.length > 0 ? matchedProducts : allProducts,
    });
  } catch (err: any) {
    console.error("AI Search Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}