import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  if (!productId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 1. Product details aur affiliate link nikalein
  const { data: product, error } = await supabase
    .from("products")
    .select("id, affiliate_url, clicks")
    .eq("id", productId)
    .single();

  if (error || !product) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2. Click count ko +1 increment karein (background me)
  await supabase
    .from("products")
    .update({ clicks: (product.clicks || 0) + 1 })
    .eq("id", productId);

  // 3. User ko destination merchant URL par safely redirect karein (302 temporary redirect)
  return NextResponse.redirect(product.affiliate_url, 302);
}