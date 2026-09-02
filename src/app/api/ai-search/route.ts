import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";

// Ensure Supabase client is initialized with proper fallbacks
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://udzdhzkbvtedyntmrpxk.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_fy-dldocPXNcQGWHT45Uqw_iPOAbxh-";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required", results: [] }, { status: 400 });
    }

    // 1. Fetch complete product details from Supabase
    const { data: allProducts, error: dbError } = await supabase
      .from("products")
      .select("*");

    if (dbError || !allProducts || allProducts.length === 0) {
      console.error("DB Error:", dbError);
      return NextResponse.json({ error: "No products available", results: [] }, { status: 500 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing in environment variables.");
      // Fallback keyword search if API key is not present
      const queryLower = prompt.toLowerCase();
      const fallback = allProducts.filter(
        (p) =>
          p.title?.toLowerCase().includes(queryLower) ||
          p.category?.toLowerCase().includes(queryLower) ||
          p.tag?.toLowerCase().includes(queryLower)
      );
      return NextResponse.json({ results: fallback });
    }

    // 2. Initialize Gemini with active key
    const ai = new GoogleGenAI({ apiKey });

    const catalogContext = allProducts.map((p) => ({
      id: String(p.id),
      title: p.title,
      category: p.category,
      price: p.price,
      merchant: p.merchant,
      tag: p.tag,
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an AI product matching system.
Query: "${prompt}"

Available inventory:
${JSON.stringify(catalogContext)}

Select only items that match the user request by style, category, or price.
Return strictly a JSON array containing only the string IDs of the matched items. Example: ["id1", "id2"]. If nothing matches, return [].`,
    });

    const responseText = response.text ? response.text.trim() : "[]";
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();

    let matchedIds: string[] = [];
    try {
      matchedIds = JSON.parse(cleanedJson);
    } catch {
      matchedIds = [];
    }

    // Map matched IDs back to the full product records (including images and URLs)
    let filteredProducts = allProducts.filter((p) =>
      matchedIds.includes(String(p.id))
    );

    // Fallback: If Gemini matched 0 items, apply a basic text filter so the user still gets results
    if (filteredProducts.length === 0) {
      const q = prompt.toLowerCase();
      filteredProducts = allProducts.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ results: filteredProducts });
  } catch (err: any) {
    console.error("Route execution failure:", err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}