import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ results: [] });
    }

    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "RAPIDAPI_KEY missing" }, { status: 500 });
    }

    const searchUrl = `https://real-time-product-search.p.rapidapi.com/search?q=${encodeURIComponent(
      prompt
    )}&country=in&language=en`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
      },
    });

    const json = await response.json();

    // Check if RapidAPI returned an error (e.g. Not Subscribed)
    if (json.message || json.status === "ERROR") {
      console.error("RapidAPI Error:", json);
      return NextResponse.json(
        { error: json.message || "API subscription required" },
        { status: 400 }
      );
    }

    const items = Array.isArray(json?.data) ? json.data : [];

    const formattedResults = items.map((item: any, index: number) => {
      // 1. Direct deep link
      const directUrl =
        item.product_page_url ||
        item.offer?.offer_page_url ||
        item.product_url ||
        item.url;

      // 2. Exact Merchant Name (Flipkart, Tata CLiQ, Amazon, etc.)
      const storeName =
        item.offer?.store_name ||
        item.store_name ||
        "Online Store";

      return {
        id: item.product_id || `prod-${index}`,
        title: item.product_title || item.title || "Product",
        price: item.offer?.price || item.product_price || "Check Price",
        original_price: item.offer?.original_price || null,
        image_url:
          item.product_photos?.[0] ||
          item.product_photo ||
          "https://placehold.co/600x400?text=Product",
        merchant: storeName,
        category: prompt,
        tag: storeName,
        affiliate_url: directUrl,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (err: any) {
    console.error("Multi-Store Search Error:", err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}