import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 1. Product fetch karein
  const { data: product, error } = await supabase
    .from("products")
    .select("id, title, merchant, clicks")
    .eq("id", productId)
    .single();

  if (error || !product) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Clicks update karein
  await supabase
    .from("products")
    .update({ clicks: (product.clicks || 0) + 1 })
    .eq("id", productId);

  // 3. Guaranteed Direct Search Landing
  // Har product ke title se direct merchant search URL generate hoga
  const encodedTitle = encodeURIComponent(product.title || "deals");
  const merchant = (product.merchant || "").toLowerCase();

  let destinationUrl = `https://www.amazon.in/s?k=${encodedTitle}`;

  if (merchant.includes("flipkart")) {
    destinationUrl = `https://www.flipkart.com/search?q=${encodedTitle}`;
  } else if (merchant.includes("myntra")) {
    destinationUrl = `https://www.myntra.com/${encodeURIComponent(product.title.replace(/\s+/g, "-"))}`;
  }

  return NextResponse.redirect(destinationUrl, 302);
}