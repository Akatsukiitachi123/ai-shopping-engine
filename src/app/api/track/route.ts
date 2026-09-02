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
    const rawItems = json?.data || [];

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const formattedResults = rawItems.map((item: any, index: number) => {
      const rawUrl =
        item?.offer?.offer_page_url ||
        item?.product_page_url ||
        item?.url ||
        item?.product_url ||
        "";

      const lowerUrl = rawUrl.toLowerCase();
      const lowerTitle = (item?.product_title || "").toLowerCase();
      const offerStore = item?.offer?.store_name || item?.store_name || "";

      let merchant = offerStore || "Store";
      if (lowerUrl.includes("flipkart") || lowerTitle.includes("flipkart")) {
        merchant = "Flipkart";
      } else if (lowerUrl.includes("tatacliq") || lowerTitle.includes("tatacliq")) {
        merchant = "Tata CLiQ";
      } else if (lowerUrl.includes("myntra") || lowerTitle.includes("myntra")) {
        merchant = "Myntra";
      } else if (lowerUrl.includes("croma") || lowerTitle.includes("croma")) {
        merchant = "Croma";
      } else if (lowerUrl.includes("amazon") || lowerTitle.includes("amazon")) {
        merchant = "Amazon";
      }

      const directUrl =
        rawUrl ||
        `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(
          item?.product_title || prompt
        )}`;

      const price =
        item?.offer?.price ||
        item?.typical_price_range?.[0] ||
        item?.product_price ||
        item?.price ||
        "Check Price";

      const originalPrice =
        item?.offer?.original_price ||
        item?.typical_price_range?.[1] ||
        null;

      const photo =
        item?.product_photos?.[0] ||
        item?.product_photo ||
        item?.photo ||
        "https://placehold.co/600x400?text=Product";

      return {
        id: item?.product_id || `product-${index}`,
        title: item?.product_title || item?.title || "Product",
        price: price,
        original_price: originalPrice,
        image_url: photo,
        merchant: merchant,
        category: prompt,
        tag: merchant,
        affiliate_url: directUrl,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (err: any) {
    console.error("Multi-Store Search API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch products", results: [] },
      { status: 500 }
    );
  }
}