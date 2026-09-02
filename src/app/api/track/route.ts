import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// Apni EarnKaro User/Referral ID yahan dalein
const EARNKARO_REF_ID = process.env.EARNKARO_REF_ID || "123456";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 1. Product details fetch karein
  const { data: product, error } = await supabase
    .from("products")
    .select("id, affiliate_url, clicks")
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

  // 3. Raw URL ko EarnKaro Monetized Affiliate link me convert karein
  const targetUrl = product.affiliate_url;
  const monetizedUrl = `https://earnkaro.com?r=${EARNKARO_REF_ID}&url=${encodeURIComponent(targetUrl)}`;

  // 4. Temporary 302 redirect
  return NextResponse.redirect(monetizedUrl, 302);
}