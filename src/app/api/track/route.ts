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

    // Direct Multi-Store Search API (Covers Amazon, Flipkart, TataCliq, Croma)
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
    const items = json?.data || [];

    const formattedResults = items.slice(0, 20).map((item: any, index: number) => {
      // Direct store product page
      const directUrl =
        item.product_page_url ||
        item.offer?.offer_page_url ||
        item.product_url ||
        item.url;

      const cleanPrice = item.offer?.price || item.product_price || item.price || "Check Price";
      const cleanOriginalPrice = item.offer?.original_price || item.product_original_price || null;

      // Extract merchant name (Flipkart, Amazon, TataCliq, etc.)
      const storeName = item.offer?.store_name || item.store_name || item.merchant || "Online Store";

      return {
        id: item.product_id || `product-${index}`,
        title: item.product_title || item.title || "Product",
        price: cleanPrice,
        original_price: cleanOriginalPrice,
        image_url:
          item.product_photos?.[0] ||
          item.product_photo ||
          item.photo ||
          "https://placehold.co/600x400?text=Product",
        merchant: storeName,
        category: prompt,
        tag: storeName,
        affiliate_url: directUrl,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (err: any) {
    console.error("Multi-Store Search API error:", err);
    return NextResponse.json({ error: "Failed to fetch multi-store products" }, { status: 500 });
  }
}