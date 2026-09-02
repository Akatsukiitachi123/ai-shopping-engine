import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EARNKARO_REF_ID = process.env.EARNKARO_REF_ID || "5599426";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 1. Product details fetch karein
  const { data: product, error } = await supabase
    .from("products")
    .select("id, affiliate_url, clicks, merchant")
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

  let targetUrl = product.affiliate_url;

  // 3. EarnKaro official dynamic deal redirect URL
  if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://"))) {
    const monetizedUrl = `https://earnkaro.com/deal?r=${EARNKARO_REF_ID}&url=${encodeURIComponent(targetUrl)}`;
    return NextResponse.redirect(monetizedUrl, 302);
  }

  return NextResponse.redirect(targetUrl || "https://amazon.in", 302);
}