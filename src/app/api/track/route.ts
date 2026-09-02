import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 1. Product details fetch karein
  const { data: product, error } = await supabase
    .from("products")
    .select("id, title, affiliate_url, merchant, clicks")
    .eq("id", productId)
    .single();

  if (error || !product) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Click count ko +1 increment karein
  await supabase
    .from("products")
    .update({ clicks: (product.clicks || 0) + 1 })
    .eq("id", productId);

  let destinationUrl = product.affiliate_url?.trim() || "";

  // 3. Smart Direct Product Landing Logic:
  // Agar link generic homepage hai ya missing hai, toh user ko exact product search par bhejenge
  const isGenericHomepage =
    !destinationUrl ||
    destinationUrl === "https://amazon.in" ||
    destinationUrl === "https://www.amazon.in" ||
    destinationUrl === "https://flipkart.com" ||
    destinationUrl === "https://www.flipkart.com" ||
    destinationUrl === "https://myntra.com" ||
    destinationUrl === "https://www.myntra.com";

  if (isGenericHomepage && product.title) {
    const encodedTitle = encodeURIComponent(product.title);
    const merchant = (product.merchant || "").toLowerCase();

    if (merchant.includes("flipkart")) {
      destinationUrl = `https://www.flipkart.com/search?q=${encodedTitle}`;
    } else if (merchant.includes("myntra")) {
      destinationUrl = `https://www.myntra.com/${encodedTitle.replace(/%20/g, "-")}`;
    } else {
      // Default / Amazon direct query search
      destinationUrl = `https://www.amazon.in/s?k=${encodedTitle}`;
    }
  }

  return NextResponse.redirect(destinationUrl, 302);
}