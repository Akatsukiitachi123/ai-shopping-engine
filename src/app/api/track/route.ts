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

    // Real-Time Product Search: multi-merchant search for India
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
      // 1. Merchant Detection from offer / store_name / product link
      const offerStore = item?.offer?.store_name || "";
      const rawUrl = item?.offer?.offer_page_url || item?.product_page_url || item?.url || "";
      const lowerUrl = rawUrl.toLowerCase();
      const lowerTitle = (item?.product_title || "").toLowerCase();

      let detectedMerchant = offerStore || "Online Store";
      if (lowerUrl.includes("flipkart") || lowerTitle.includes("flipkart")) {
        detectedMerchant = "Flipkart";
      } else if (lowerUrl.includes("tatacliq") || lowerTitle.includes("tatacliq")) {
        detectedMerchant = "Tata CLiQ";
      } else if (lowerUrl.includes("myntra")) {
        detectedMerchant = "Myntra";
      } else if (lowerUrl.includes("croma")) {
        detectedMerchant = "Croma";
      } else if (lowerUrl.includes("amazon")) {
        detectedMerchant = "Amazon";
      }

      // 2. Direct Single Product Landing Link
      const directUrl = rawUrl || `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(item?.product_title || prompt)}`;

      // 3. Clean Price
      const priceVal = item?.offer?.price || item?.typical_price_range?.[0] || item?.price || "Check Price";

      // 4. Image extraction
      const photo =
        item?.product_photos?.[0] ||
        item?.product_photo ||
        "https://placehold.co/600x400?text=Product";

      return {
        id: item?.product_id || `multi-${index}`,
        title: item?.product_title || item?.title || "Product",
        price: priceVal,
        original_price: item?.offer?.original_price || null,
        image_url: photo,
        merchant: detectedMerchant,
        category: prompt,
        tag: detectedMerchant,
        affiliate_url: directUrl,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (err: any) {
    console.error("API Fetch Error:", err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}