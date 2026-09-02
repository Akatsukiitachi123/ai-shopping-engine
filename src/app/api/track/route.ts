import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 1. Database se product title fetch karein
  const { data: product } = await supabase
    .from("products")
    .select("id, title, affiliate_url, clicks")
    .eq("id", productId)
    .single();

  if (!product) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Click count increment karein
  await supabase
    .from("products")
    .update({ clicks: (product.clicks || 0) + 1 })
    .eq("id", productId);

  const rawUrl = (product.affiliate_url || "").trim();

  // 3. Agar direct valid product page link hai (jisme /dp/ ya specific item path ho)
  if (rawUrl.includes("/dp/") || rawUrl.includes("/p/")) {
    return NextResponse.redirect(rawUrl, 302);
  }

  // 4. Guaranteed Direct Single Product Landing:
  // Kisi bhi homepage ya broken redirect link ko bypass karke direct Amazon product search par land karwayenge
  const safeTitle = encodeURIComponent(product.title || "product deal");
  const directStoreUrl = `https://www.amazon.in/s?k=${safeTitle}`;

  return NextResponse.redirect(directStoreUrl, 302);
}