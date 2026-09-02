import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "@/lib/supabase";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 1. Supabase se saare active products fetch karein
    const { data: allProducts, error } = await supabase
      .from("products")
      .select("id, title, category, price, merchant, tag");

    if (error || !allProducts || allProducts.length === 0) {
      return NextResponse.json({ error: "No products in database" }, { status: 404 });
    }

    // 2. Gemini ko structured inventory provide karein
    const catalogSummary = allProducts.map((p) => ({
      id: String(p.id),
      title: p.title,
      category: p.category,
      price: p.price,
      merchant: p.merchant,
      tag: p.tag,
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are an intelligent shopping assistant.
User Intent / Query: "${prompt}"

Current Inventory:
${JSON.stringify(catalogSummary, null, 2)}

Instructions:
1. Filter and select ONLY products that match the user's intent, category, keywords, or price budget.
2. Rank the best matches first.
3. If no product matches closely, return an empty array [].
4. Return ONLY a valid JSON array of matched product string IDs. No text, no markdown.

Example valid output:
["uuid-1", "uuid-2"]
      `,
    });

    let rawText = response.text || "[]";
    
    // Markdown formatting remove karein
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    let matchedIds: string[] = [];
    try {
      matchedIds = JSON.parse(rawText);
    } catch {
      matchedIds = [];
    }

    // 3. Matched IDs ke basis par full product objects filter karein
    const filteredProducts = matchedIds
      .map((id) => allProducts.find((p) => String(p.id) === String(id)))
      .filter(Boolean);

    // Agar koi match mila to wahi return karein, warna empty array (taaki user ko pata chale koi match nahi mila)
    return NextResponse.json({
      results: filteredProducts,
      totalMatched: filteredProducts.length,
    });
  } catch (err: any) {
    console.error("AI Search Error:", err);
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}