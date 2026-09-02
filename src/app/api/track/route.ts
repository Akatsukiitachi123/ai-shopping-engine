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

    // Google Shopping / Multi-Store endpoint
    const searchUrl = `https://real-time-product-search.p.rapidapi.com/search?q=${encodeURIComponent(
      prompt
    )}&country=in&language=en&limit=20`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": "real-time-product-search.p.rapidapi.com",
      },
    });

    const json = await response.json();
    
    // API ya toh array deti hai ya data.products
    const items = Array.isArray(json?.data) 
      ? json.data 
      : json?.data?.products || [];

    if (!items || items.length === 0) {
      console.log("No items returned from API:", json);
      return NextResponse.json({ results: [] });
    }

    const formattedResults = items.map((item: any, index: number) => {
      // 1. Direct single product page URL
      const directUrl =
        item.offer?.offer_page_url ||
        item.product_page_url ||
        item.product_url ||
        item.url ||
        `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item.product_title || prompt)}`;

      // 2. Exact Store Name (Flipkart, Tata CLiQ, Amazon, Myntra, etc.)
      let store =
        item.offer?.store_name ||
        item.store_name ||
        item.typical_price_range?.[2] ||
        "Online Store";

      // Title se store detect karna agar API tag na de
      const fullText = `${item.product_title || ""} ${directUrl}`.toLowerCase();
      if (fullText.includes("flipkart")) store = "Flipkart";
      else if (fullText.includes("tatacliq") || fullText.includes("tata cliq")) store = "Tata CLiQ";
      else if (fullText.includes("myntra")) store = "Myntra";
      else if (fullText.includes("croma")) store = "Croma";
      else if (fullText.includes("amazon")) store = "Amazon";

      // 3. Price formatting
      const price =
        item.offer?.price ||
        item.product_price ||
        item.price ||
        "Check Price";

      const originalPrice =
        item.offer?.original_price ||
        item.product_original_price ||
        null;

      const photo =
        item.product_photos?.[0] ||
        item.product_photo ||
        item.photo ||
        "https://placehold.co/600x400?text=Product";

      return {
        id: item.product_id || `prod-${index}`,
        title: item.product_title || item.title || "Product",
        price: price,
        original_price: originalPrice,
        image_url: photo,
        merchant: store,
        category: prompt,
        tag: store,
        affiliate_url: directUrl,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (err: any) {
    console.error("Multi-Store Search API error:", err);
    return NextResponse.json({ error: "Failed to fetch multi-store products", results: [] }, { status: 500 });
  }
}