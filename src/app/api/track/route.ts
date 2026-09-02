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
      return NextResponse.json(
        { error: "RAPIDAPI_KEY is missing in environment variables" },
        { status: 500 }
      );
    }

    const searchUrl = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(
      prompt
    )}&page=1&country=IN`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
      },
    });

    const json = await response.json();
    const items = json?.data?.products || [];

    const formattedResults = items.slice(0, 16).map((item: any, index: number) => {
      const cleanPrice = item.product_price
        ? item.product_price.replace(/[^0-9.]/g, "")
        : "Check Price";
      const cleanOriginalPrice = item.product_original_price
        ? item.product_original_price.replace(/[^0-9.]/g, "")
        : null;

      // Bulletproof Amazon Single Product URL using ASIN
      const directProductUrl = item.asin
        ? `https://www.amazon.in/dp/${item.asin}`
        : item.product_url;

      return {
        id: item.asin || `live-${index}`,
        title: item.product_title,
        price: cleanPrice,
        original_price: cleanOriginalPrice,
        image_url: item.product_photo,
        merchant: "Amazon",
        category: prompt,
        tag: item.is_best_seller ? "Bestseller" : item.is_prime ? "Prime" : "Deal",
        affiliate_url: directProductUrl,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (err: any) {
    console.error("Live Search API error:", err);
    return NextResponse.json({ error: "Failed to fetch live products" }, { status: 500 });
  }
}