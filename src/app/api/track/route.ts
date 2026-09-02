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

  // 3. User ko bina kisi middleman page ke seedha store page par redirect karein
  const destinationUrl = product.affiliate_url || "https://amazon.in";

  return NextResponse.redirect(destinationUrl, 302);
}